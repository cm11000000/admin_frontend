# Subdomain Setup Instructions for Admin Portal

## Current Status
- ✅ Admin portal deployed to S3
- ✅ CloudFront distribution created and working
- ✅ HTTPS enabled at: https://d3ltikj36wzl4t.cloudfront.net
- ❌ Custom subdomain needs admin access to create

## What You Need (Admin to Execute)

Someone with admin access to the **master AWS account (070658298707)** needs to create the DNS record.

## Option 1: Ask Admin via Email

Send this to your admin (e.g., abhimanyu.jha@sabpaisa.in):

```
Subject: Need DNS Subdomain for Admin Portal

Hi,

I've successfully deployed the SabPaisa Admin Portal to AWS with HTTPS enabled.
I need a DNS subdomain created to make it accessible via a friendly URL.

Please create the following DNS record in Route53:

Hosted Zone ID: Z06541923RERTQXE41XSI
Record Type: CNAME
Subdomain: admin.rnd.sabpaisa.in
Points to: d3ltikj36wzl4t.cloudfront.net
TTL: 300

This will make the admin portal accessible at:
http://admin.rnd.sabpaisa.in (will redirect to HTTPS)

The portal is currently working at:
https://d3ltikj36wzl4t.cloudfront.net

Thanks,
Chaitanya
```

## Option 2: Admin Console Steps

If you get admin access, follow these steps:

1. **Login to AWS Console** as admin
2. Go to **Route53** service
3. Click on **Hosted zones**
4. Find the zone for `rnd.sabpaisa.in` (ID: Z06541923RERTQXE41XSI)
5. Click **Create record**
6. Fill in:
   - Record name: `admin`
   - Record type: `CNAME`
   - Value: `d3ltikj36wzl4t.cloudfront.net`
   - TTL: `300`
7. Click **Create records**

## Option 3: CLI Command (for Admin)

If admin has AWS CLI access:

```bash
# Create the CNAME record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z06541923RERTQXE41XSI \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "admin.rnd.sabpaisa.in",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "d3ltikj36wzl4t.cloudfront.net"}]
      }
    }]
  }'
```

## Current Working URLs (Without Subdomain)

While waiting for the subdomain, you can use:

### ✅ **Fully Working HTTPS URL:**
```
https://d3ltikj36wzl4t.cloudfront.net
```

### Direct Access Links:
- Login: https://d3ltikj36wzl4t.cloudfront.net/login/
- Dashboard: https://d3ltikj36wzl4t.cloudfront.net/dashboard/
- Clients: https://d3ltikj36wzl4t.cloudfront.net/clients/
- Transactions: https://d3ltikj36wzl4t.cloudfront.net/transactions/

## After Subdomain Creation

Once the admin creates the subdomain, you'll be able to access at:
- `http://admin.rnd.sabpaisa.in` (will redirect to HTTPS)
- Note: HTTPS on the subdomain will show certificate warnings unless we add SSL certificate

## Technical Details

- **CloudFront Distribution ID**: E3A630N588UPWD
- **S3 Bucket**: sabpaisa-admin-v5-20251010
- **Region**: ap-south-1 (Mumbai)
- **Route53 Hosted Zone**: Z06541923RERTQXE41XSI (master account)

## Why Can't We Create It?

The Route53 hosted zone for `rnd.sabpaisa.in` is in the master account (070658298707), not in your developer account (408876511992). Only users with admin permissions in the master account can create DNS records there.

## Alternative: Your Own Domain

If you have your own domain, you can create a CNAME record pointing to:
`d3ltikj36wzl4t.cloudfront.net`

This would work immediately without needing admin access.