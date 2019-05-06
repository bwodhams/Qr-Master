This is the backend code used by the QRCodes4Good App AND the frontend code used for the QRCodes4Good website.

To get started, clone repo on your server, enter the directory and do npm install.

Azure Database Login Information
================================

Setting up the Database can be done by following the tutorial here :  (https://www.youtube.com/watch?v=0U2jV1thfvs)

Server information (connect via SSH)
====================================
IP : 104.42.36.29

Username : qrcodes4good

Password : [removed and changed]

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

Sample usage to restart frontend and backend server
-----------------------------------
| Command | Description |
| ------- | ----------- |
| `screen -S NameScreen` | Create screen with specific name for easy identifiability |
| `screen -ls` | list all currently running screens |
| `screen -r 1791` | connect to node screen |
| ctrl + c | stop node service |
| `node server/server.js` | start node service |
| ctrl + a + d | detach from screen and leave node service running |


Support Email Access (from namecheap - domain provider)
====================
https://privateemail.com/appsuite/index.html

Email : support@qrcodes4good.com

Password : [removed and changed]



Server routes
=============
HOST : https://www.qrcodes4good.com OR https://104.42.36.29


Sample account {"email": "bpwodhams@gmail.com", "password": "Abc1234"}

NOTE : Almost all routes require header including authorization token. (no tokens for registration, verify, login etc)


| Mode | Route | Description | Expected Input | Expected Output | Sample Usage |
| :---: | ----- | ----------- | -------------- | ------------ | -------- |
| GET  |  {HOST}/api/verify/ | Verify a user's email address | Email address and the verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link to verify. | JSON object `{"message": "some message"}` | /api/verify/:email&:code |
| PUT | {HOST}/api/user/create | Create new account | Body containing email, name, password, confirmPassword | JSON object `{"message": "some message", "accountCreated": true or false}` | /api/create  with request body of {"email": "random@gmail.com", "name": "Random Name", "password": "randomPassword", "confirmPassword": "randomPassword"} |
| POST | {HOST}/api/user/login | Login to account | Body containing email, inputPassword, devId. Code can detect type of login based on sent variables. Email is always required. | JSON object `{"message": "someMessage", "loggedIn": true or false, "loginAuthToken": "1234", "touchAuthToken": "1234", "name": "account name"}` | /api/user/login  with request body of {"email": "random@gmail.com", "inputPassword": "randomPassword", "devId": "1234"} |
| POST | {HOST}/api/user/bioLogin | Login to account with biometric security | Body containing biometric token and unique device id. | JSON object `{"message": "someMessage", "loggedIn": T/F, "loginAuthToken": "1234", "touchAuthToken": "1234", "name": "account name"}` | /api/user/bioLogin with request body of {"touchAuthToken": "1234", "devId": "1234"} |
| POST | {HOST}/api/user/ updateStripe | Update stripe info | Body containing email, creditCard, cvv, billingFirstName, billingLastName, billingAddress, billingCity, billingState, billingZip | JSON object of the user `{\_id, email, name, passwordHash, emailVerifCode, stripeData[]}` | /api/user/updateStripe   with request body of `{"email": "random@gmail.com", "creditCard": "123456789", "exp": "02/2019", "cvv": "123", "billingFirstName": "First", "billingLastName": "Last", "billingAddress": "123 Random Street", "billingCity": "Tucson", "billingState": "AZ", "billingZip": "12345"}` |
| GET | {HOST}/api/user/ getCards/:email | Get cards connected to user's account. | Email address | JSON object stripeData{}| /api/user/getCards/random@gmail.com |
| DELETE | {HOST}/api/user/:email | Delete account. | Email address | JSON object of deleted user | /api/user/random@gmail.com |
| PUT | {HOST}/api/user/update | Update account information | Body containing email, newEmail, name, currentPassword, newPassword, confirmNewPassword. Email is always required. | JSON object `{"message": "someMessage"}` | /api/user/update with request body of `{"email": "random@gmail.com", "name": "New Name"}` |
| POST | {HOST}/api/user/ forgotPassword | Send email to reset password on an account. | Email address | JSON object `{"message": "some message"}` | /api/user/forgotPassword with request body of `{"email": "random@gmail.com"}` |
| GET | {HOST}/api/user/ resetPassword/ | Allow user's account to be allowed to reset password | Email address and verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link. | JSON object `{"message": "some message"}` | /api/user/resetPassword/:email&:code |
| POST | {HOST}/api/user/ updateResetPassword | Change account's password after reset has been initiated | Email address, resetPasswordCode (obtained from resetPassword link), newPassword, confirmNewPassword | JSON object `{"message" : "some message"}` | /api/user/updateResetPassword with body of `{"email": "random@gmail.com", "resetPasswordCode": "12345", "newPassword": "randomPassword", "confirmNewPassword": "randomPassword"}` |
| POST | {HOST}/api/user/ generateQRCode | Generate a QR code | Body containing loginAuthToken, defaultAmount, paymentType, qrCodeGivenName | JSON object `{"message": "some message", "qrcodeData": "generated qrcode in data form", "qrcodeString": "generated qrcode in string form (svg form for displaying in react)"}` | /api/user/generateQRCode with body of `{"loginAuthToken": "userLoginAuthToken", "defaultAmount": "5", "paymentType": "Tip", "qrCodeGivenName": "Valet Parking Code"}` |
| GET | {HOST}/api/user/ getQRCodes | Get user's generated QRCodes | Header containing session token | JSON object `{"message": "some message", "qrcodes": "array of all generated qrcodes for user"}` | /api/user/getQRCodes with session token in header |
| DELETE | {HOST}/api/user/ deleteQRCode | Delete a QR code | Body containing loginAuthToken, deleteID | JSON object `{"message": "some message"}` | /api/user/deleteQRCode with body of `{"loginAuthToken": "userLoginAuthToken", "deleteID": 0}` |
| POST | {HOST}/api/user/resendConfirmationEmail | Resend account confirmation email | Body containing email | JSON object `{"message": "some message"}` | /api/user/resendConfirmationEmail with body of `{"email" : "random@gmail.com"}` |
| PUT | {HOST}/api/user/saveQRCode | Save a scanned QRCode | Body containing userID, qrcodeData | JSON object `{"message": "some message"}` | /api/user/saveQRCode with body of `{"userID": "12345", "qrcodeData": "data"}` |
| GET | {HOST}/api/user/ getSavedQRCodes | Get user's saved QRCodes | Header containing session token | JSON object `{"message": "some message", "qrcodes": "array of all saved qrcodes for user"}` | /api/user/getSavedQRCodes with session token in header |
| POST | {HOST}/api/user/tosUpdate | Update user value once they accept the ToS | Header containing auth token, body containing email | JSON object `{"message": "some message", "tosAccepted": true}` | /api/user/tosUpdate with header of "authorization", body of email |
| POST | {HOST}/api/user/verifyStripe | Verify user before they can receive payments to their bank account | Header containing auth token, body containing email, ssn_last_4, dob_day, dob_month, dob_year, city, line1, postal_code, state | JSON object `{"message": "some message", "verification": true}` | /api/user/verifyStripe with header of "authorization", body of `{"email": "random@gmail.com", "ssn_last_4": "1234", "dob_day": "01", "dob_month": "02", "dob_year": "2019", "city": "Tucson", "line1": "123 Some Street", "postal_code": "12345", "state": "Arizona"}` |
| POST | {HOST}/api/user/transaction | Send money from one user to another | Header containing auth token, body containing email, receiverID, amount, anonymous | JSON object `{"message": "some message", "success": true}` | /api/user/transaction with header of "authorization", body of `{"email": "random@gmail.com", "receiverID" : "12345", "amount": "10.00", "anonymous" : true}` |
| GET | {HOST}/api/user/transactionHistory | Get user tx history | Header containing auth token | JSON object `{"message": "some message", "sent": [array of sent payments], "received": [array of received payments]}` | /api/user/transactionHistory with header of "authorization" |
| POST | {HOST}/api/user/deleteSavedQRCode | Delete a saved QRCode | Header containing auth token, body containing deleteID | JSON object `{"message": "some message"}` | /api/user/deleteSavedQRCode with header of "authorization", body of `{"deleteID": 1}` |
| PUT | {HOST}/api/user/updateDefaultPayment | Update user default payment method | Header containing auth token, body containing defaultIndex | JSON object `{"message": "some message", "stripeData": [array of all user cards / banks]}` | /api/user/updateDefaultPayment with header of "authorization", body of `{"defaultIndex": 1}` |
| POST | {HOST}/api/user/deletePayment | Delete payment method | Header containing auth token, body containing deleteIndex | JSON object `{"message": "some message", "stripeData": [array of all user cards / banks]}` | /api/user/deletePayment with header of "authorization", body of `{"deleteIndex": 1}` |
| POST | {HOST}/api/user/contactUs | Send contact us email | Body containing name, email, message | JSON object `{"message": "some message"}` | /api/user/contactUs with body of `{"name": "My Name", "email": "random@gmail.com", "message": "I really like your website and your service!"}` |
| GET | {HOST}/api/user/getSimpleInfo | Get user name for website | Header containing auth token | JSON object `{"message": "some message", "name": "account Name"}` | /api/user/getSimpleInfo with header of "authorization" |

