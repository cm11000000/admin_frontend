#!/usr/bin/env bash
set -euo pipefail

# Frontend deploy script for sabpaisa_admin_v5 (Next.js static export)
# - Builds static site (next build + next export)
# - Syncs to S3 with proper cache headers (immutable for assets, no-cache for HTML)
# - Optional CloudFront invalidation
# - Safe to run repeatedly after code changes

# Defaults (can be overridden via flags or env)
AWS_PROFILE_DEFAULT="chaitanya-rnd"
AWS_REGION_DEFAULT="ap-south-1"

AWS_PROFILE="${AWS_PROFILE:-$AWS_PROFILE_DEFAULT}"
AWS_REGION="${AWS_REGION:-$AWS_REGION_DEFAULT}"
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-admin-v5}"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-}"

usage() {
  cat << EOF
Usage: $(basename "$0") -b <bucket> [-p <prefix>] [-r <region>] [-d <cloudfront_id>] [--profile <aws_profile>]

Required:
  -b, --bucket        S3 bucket name (e.g., my-site-bucket)

Optional:
  -p, --prefix        S3 prefix/path (default: admin-v5)
  -r, --region        AWS region (default: ${AWS_REGION_DEFAULT})
  -d, --distribution  CloudFront distribution ID for invalidation (optional)
      --profile       AWS CLI profile (default: ${AWS_PROFILE_DEFAULT})

Environment overrides:
  AWS_PROFILE, AWS_REGION, S3_BUCKET, S3_PREFIX, CF_DISTRIBUTION_ID

Examples:
  AWS_PROFILE=${AWS_PROFILE_DEFAULT} ./deploy.sh -b chaitanya-rnd-site -p admin-v5
  ./deploy.sh --bucket my-bucket --distribution E123ABC456DEF --profile ${AWS_PROFILE_DEFAULT}
EOF
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--bucket) S3_BUCKET="$2"; shift 2;;
    -p|--prefix) S3_PREFIX="$2"; shift 2;;
    -r|--region) AWS_REGION="$2"; shift 2;;
    -d|--distribution) CF_DISTRIBUTION_ID="$2"; shift 2;;
    --profile) AWS_PROFILE="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown argument: $1"; usage; exit 1;;
  esac
done

if [[ -z "${S3_BUCKET}" ]]; then
  echo "[ERROR] S3 bucket is required"
  usage
  exit 1
fi

echo "=== Frontend Deploy (sabpaisa_admin_v5) ==="
echo "AWS Profile     : ${AWS_PROFILE}"
echo "AWS Region      : ${AWS_REGION}"
echo "S3 Bucket       : s3://${S3_BUCKET}"
echo "S3 Prefix       : ${S3_PREFIX}"
echo "CloudFront ID   : ${CF_DISTRIBUTION_ID:-<none>}"

# Verify prerequisites
command -v aws >/dev/null 2>&1 || { echo "[ERROR] aws CLI not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[ERROR] node not found"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm not found"; exit 1; }

echo "[Check] AWS credentials for profile '${AWS_PROFILE}'"
aws sts get-caller-identity --profile "${AWS_PROFILE}" >/dev/null || {
  echo "[ERROR] Unable to use AWS profile '${AWS_PROFILE}'. Configure with 'aws configure --profile ${AWS_PROFILE}'."; exit 1;
}

# Ensure bucket exists (create if missing)
echo "[Check] S3 bucket existence: ${S3_BUCKET}"
if ! aws s3api head-bucket --bucket "${S3_BUCKET}" --profile "${AWS_PROFILE}" 2>/dev/null; then
  echo "[Create] Bucket '${S3_BUCKET}' in region '${AWS_REGION}'"
  if [[ "${AWS_REGION}" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "${S3_BUCKET}" --region "${AWS_REGION}" --profile "${AWS_PROFILE}"
  else
    aws s3api create-bucket --bucket "${S3_BUCKET}" --region "${AWS_REGION}" \
      --create-bucket-configuration LocationConstraint="${AWS_REGION}" --profile "${AWS_PROFILE}"
  fi
fi

# Move to script directory (repo/sabpaisa_admin_v5)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "[Step] Install deps"
if [[ -f package-lock.json ]]; then
  npm ci || npm install
else
  npm install
fi

echo "[Step] Build static site (next export)"
rm -rf .next out
if npm run build:static; then
  echo "[OK] Build complete"
else
  echo "[WARN] 'build:static' script missing. Falling back to 'next build && next export'"
  npx next build
  npx next export
fi

if [[ ! -d out ]]; then
  echo "[ERROR] Static export folder 'out' not found"
  exit 1
fi

DEST="s3://${S3_BUCKET}/${S3_PREFIX}"
echo "[Deploy] Sync assets (immutable cache) to ${DEST}"
aws s3 sync out "${DEST}" \
  --delete \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --exclude "*.html" \
  --exclude "404.html" \
  --cache-control "public, max-age=31536000, immutable"

echo "[Deploy] Sync HTML (no-cache) to ${DEST}"
aws s3 sync out "${DEST}" \
  --delete \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --exclude "*" \
  --include "*.html" \
  --include "**/*.html" \
  --cache-control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"

if [[ -n "${CF_DISTRIBUTION_ID}" ]]; then
  echo "[CDN] Create CloudFront invalidation /* for ${CF_DISTRIBUTION_ID}"
  aws cloudfront create-invalidation \
    --distribution-id "${CF_DISTRIBUTION_ID}" \
    --paths "/*" \
    --profile "${AWS_PROFILE}" >/dev/null && echo "[CDN] Invalidation submitted"
fi

echo "\n=== Deploy complete ==="
echo "S3 URL: ${DEST}"
echo "Tip: For S3 static website hosting, enable website on the bucket and map ${S3_PREFIX}/ as needed."

