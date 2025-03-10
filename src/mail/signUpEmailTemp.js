const signUpEmailTemp = (data) => `
  <html>
    <head>
      <style>
        body {
          font-family: 'Verdana', 'Arial', sans-serif;        
          font-family: Arial, sans-serif;
          background-color: #f2f3f8;
          margin: 0;
          padding: 0;
        }
        .container {
          font-family: 'Verdana', 'Arial', sans-serif;        
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #8A53FE;
          font-size: 26px;
          margin-bottom: 20px;
          font-weight: bold;
          text-align: center;
        }
        p {
          color: #555555;
          line-height: 1.8;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .logo {
          text-align: center;
        }
        .logo-img {
          max-width: 100%;
          margin-bottom: 20px;
        }
        .code {
          text-align: center;
          background-color: #e8f0fe;
          padding: 14px 24px;
          font-size: 20px;
          font-weight: bold;
          color: #8A53FE;
          border-radius: 6px;
          letter-spacing: 2px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #9e9e9e;
          text-align: center;
        }
        .footer p {
          margin: 5px 0;
        }
        a {
          color: #8A53FE;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="${process.env.EMAIL_TEMP_IMAGE}" alt="Logo" class="logo-img" />
        </div>
        <h1>Welcome to Dudu</h1>
        <p>Hello, ${data.user}</p>
        <p>Thank you for registering with Dudu. To activate your account, please use the following activation code:</p>
        <div class="code">${data.activationCode}</div>
        <p>Please enter this code on the activation page within the next <strong>${data.activationCodeExpire} minutes</strong>.</p>
        <p>If you have any questions, please contact us at <a href="mailto:thakursaad613@gmail.com">thakursaad613@gmail.com</a>.</p>
        <p>Thank you,<br>The Dudu Team</p>
      </div>
      <div class="footer">
        <p>&copy; Dudu - All Rights Reserved.</p>
        <p>
          <a href="https://yourwebsite.com/privacy">Privacy Policy</a> |
          <a href="https://yourwebsite.com/contact">Contact Support</a>
        </p>
      </div>
    </body>
  </html>
`;

module.exports = signUpEmailTemp;
