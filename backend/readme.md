This is the backend code used by the QRCodes4Good App.

To get started, clone repo, enter the directory and do npm install.
Also need npm install react-native-bcrypt  and npm install bcryptjs

For more explicit instructions, check out the howTo.md file.

Azure Database Login Information
================================
(Account is linked to my Arizona account, so you'll have to do 2FA, so just make sure you tell me before you attempt to login)

https://azure.microsoft.com

Username : bwodhams@email.arizona.edu

Password : [r7:fXNcEx^Vc#P

Server information (connect via SSH)
====================================
IP : 104.42.36.29

Username : qrcodes4good

Password : 1282*^nb7*(56&

To log in with a key instead of the password:

```
$ ssh-keygen -t rsa
$ cat ~/.ssh/id_rsa.pub | ssh qrcodes4good@104.42.36.29 'cat >> .ssh/authorized_keys'
```

And enter the password one last time

Once logged in, all pertinent information can  be found at route 
/app/

Using [`screen`](https://linux.die.net/man/1/screen) to allow app to run without needing to stay connected to server. 

Frequently used commands
------------------------
| Command | Description |
| ------- | ----------- |
| `screen -ls` | list all currently running screens |
| `screen -r 1234` | connect to screen with id number 1234 |
| ctrl + a + d | disconnect from screen (detach) and leave running |

Sample usage to restart node server
-----------------------------------
| Command | Description |
| ------- | ----------- |
| `screen -S NameScreen` | Create screen with specific name for easy identifiability |
| `screen -ls` | list all currently running screens |
| `screen -r 1791` | connect to node screen |
| ctrl + c | stop node service |
| `node server/server.js` | start node service |
| ctrl + a + d | detach from screen and leave node service running |


Sample usage to restart front end
---------------------------------
| Command | Description |
| ------- | ----------- |
| `serve -s build -l 80` | Serve frontend page on port 80 |



Server routes
=============
HOST : https://104.42.36.29:8080   OR  https://www.qrcodes4good.com:8080       http://www.microsoftgive.com:8080 (not working due to no SSL cert)

Sample account {"email": "bpwodhams@gmail.com", "password": "Abc1234"}

| Mode | Route | Description | Expected Input | Expected Output | Sample Usage |
| :---: | ----- | ----------- | -------------- | ------------ | -------- |
| GET  |  {HOST}/api/verify/ | Verify a user's email address | Email address and the verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link to verify. | JSON object {"message": "some message"} | /api/verify/:email&:code |
| PUT | {HOST}/api/user/create | Create new account | Body containing email, name, password, confirmPassword | JSON object {"message": "some message", "accountCreated": true or false} | /api/create  with request body of {"email": "random@gmail.com", "name": "Random Name", "password": "randomPassword", "confirmPassword": "randomPassword"} |
| POST | {HOST}/api/user/login | Login to account | Body containing email, inputPassword, devId. Code can detect type of login based on sent variables. Email is always required. | JSON object {"message": "someMessage", "loggedIn": true or false, "loginAuthToken": "1234", "touchAuthToken": "1234", "name": "account name"} | /api/user/login  with request body of {"email": "random@gmail.com", "inputPassword": "randomPassword", "devId": "1234"} |
| POST | {HOST}/api/user/bioLogin | Login to account with biometric security | Body containing biometric token and unique device id. | JSON object {"message": "someMessage", "loggedIn": T/F, "loginAuthToken": "1234", "touchAuthToken": "1234", "name": "account name"} | /api/user/bioLogin with request body of {"touchAuthToken": "1234", "devId": "1234"} |
| POST | {HOST}/api/user/updateStripe | Update stripe info | Body containing email, creditCard, cvv, billingFirstName, billingLastName, billingAddress, billingCity, billingState, billingZip | JSON object of the user {\_id, email, name, passwordHash, emailVerifCode, stripeData[]} | /api/user/updateStripe   with request body of {"email": "random@gmail.com", "creditCard": "123456789", "exp": "02/2019", "cvv": "123", "billingFirstName": "First", "billingLastName": "Last", "billingAddress": "123 Random Street", "billingCity": "Tucson", "billingState": "AZ", "billingZip": "12345"} |
| GET | {HOST}/api/user/getCards/ | Get cards connected to user's account. | Email address | JSON object stripData{}| /api/user/getCards/:random@gmail.com |
| DELETE | {HOST}/api/user/:email | Delete account. | Email address | JSON object of deleted user | /api/user/random@gmail.com |
| POST | {HOST}/api/user/update | Update account information | Body containing email, newEmail, name, currentPassword, newPassword, confirmNewPassword. Email is always required. | JSON object {"message": "someMessage"} | /api/user/update with request body of {"email": "random@gmail.com", "name": "New Name"} |
| POST | {HOST}/api/user/forgotPassword | Send email to reset password on an account. | Email address | JSON object {"message": "some message"} | /api/user/forgotPassword with request body of {"email": "random@gmail.com"} |
| GET | {HOST}/api/user/resetPassword/ | Allow user's account to be allowed to reset password | Email address and verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link. | JSON object {"message": "some message"} | /api/user/resetPassword/:email&:code |
| POST | {HOST}/api/user/updateResetPassword | Change account's password after reset has been initiated | Email address, resetPasswordCode (obtained from resetPassword link), newPassword, confirmNewPassword | JSON object {"message" : "some message"} | /api/user/updateResetPassword with body of {"email": "random@gmail.com", "resetPasswordCode": "12345", "newPassword": "randomPassword", "confirmNewPassword": "randomPassword"} |
| POST | {HOST}/api/user/generateQRCode | Generate a QR code | Body containing email, password, defaultAmount, paymentType, qrCodeName | JSON object {"message": "some message", "qrcodeData": "generated qrcode in data form", "qrcodeString": "generated qrcode in string form (svg form for displaying in react)"} | /api/user/generateQRCode with body of {"email": "random@gmail.com", "password": "randomPassword", "defaultAmount": "5", "paymentType": "Tip", "qrCodeName": "Valet Parking Code"} |