<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{ $emailSubject ?? 'PINTAARA Fine Jewellery' }}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #FAF9F5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1A1A1A;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #FAF9F5;
      padding: 40px 16px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EAE6DF;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      padding: 36px 32px 24px 32px;
      text-align: center;
      border-bottom: 1px solid #F0ECE4;
      background-color: #FFFFFF;
    }
    .brand-title {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.32em;
      color: #1A1A1A;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #B8860B;
      margin-top: 6px;
      font-weight: 600;
    }
    .content {
      padding: 36px 36px 28px 36px;
      color: #2D2D2D;
      font-size: 14.5px;
    }
    .h1-title {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 16px 0;
      line-height: 1.35;
    }
    .subtitle {
      font-size: 14px;
      color: #666666;
      margin: 0 0 20px 0;
    }
    .section-label {
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #1A1A1A;
      margin: 26px 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #F0ECE4;
    }
    .detail-card {
      background-color: #FDFCF9;
      border: 1px solid #EFECE6;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 14px 0 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13.5px;
      border-bottom: 1px dotted #EFECE6;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666666;
      font-weight: 500;
    }
    .detail-value {
      color: #1A1A1A;
      font-weight: 700;
      text-align: right;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 24px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #1A1A1A;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 14px 34px;
      border-radius: 4px;
      border: 1px solid #1A1A1A;
    }
    .btn-primary:hover {
      background-color: #B8860B;
      border-color: #B8860B;
    }
    .note-box {
      background-color: #F8F7F2;
      border-left: 3px solid #B8860B;
      padding: 14px 18px;
      font-size: 13px;
      color: #555555;
      margin: 22px 0;
      border-radius: 0 4px 4px 0;
    }
    .otp-display {
      text-align: center;
      background-color: #F7F5EE;
      border: 1px dashed #D5CEBE;
      border-radius: 6px;
      padding: 22px;
      margin: 24px 0;
    }
    .otp-code {
      font-family: "Courier New", Courier, monospace;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.28em;
      color: #1A1A1A;
    }
    .footer {
      padding: 24px 32px 32px 32px;
      text-align: center;
      border-top: 1px solid #F0ECE4;
      background-color: #FAF9F5;
      font-size: 11.5px;
      color: #888888;
      line-height: 1.8;
    }
    .footer strong {
      color: #444444;
      letter-spacing: 0.15em;
    }
    .footer a {
      color: #B8860B;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      
      <!-- Brand Header -->
      <div class="header" style="padding: 34px 24px 22px 24px; text-align: center; border-bottom: 1px solid #F0ECE4; background-color: #FFFFFF;">
        <a href="{{ rtrim(config('app.url', 'https://pintaara.com'), '/') }}" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="{{ rtrim(config('app.url', 'https://pintaara.com'), '/') }}/images/mobile/logo-wordmark.png" alt="PINTAARA" width="200" style="display: block; width: 200px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none; margin: 0 auto; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; letter-spacing: 0.28em; color: #9A7228;" />
        </a>
      </div>

      <!-- Main Body Yield -->
      <div class="content">
        @yield('content')

        <!-- Standard Sign-off -->
        <div style="margin-top: 32px; font-family: Georgia, serif; font-size: 15px; color: #1A1A1A;">
          PINTAARA
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div style="font-size: 10.5px; color: #AAAAAA;">&copy; {{ date('Y') }} PINTAARA. All rights reserved.</div>
      </div>

    </div>
  </div>
</body>
</html>
