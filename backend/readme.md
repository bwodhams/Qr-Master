This is the backend code used by the QRCodes4Good App.

To get started, clone repo, enter the directory and do npm install.
Also need npm install react-native-bcrypt  and npm install bcryptjs

For more explicit instructions, check out the howTo.md file.

Server routes
HOST : http://104.42.36.29:3001

| Mode | Route | Description | Expected Input |
| ---- | ----- | ----------- | -------------- |
| GET  |  {HOST}/api/user/ | Verify a user's email address | Email address and the verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link to verify.