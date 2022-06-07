About this API

This api include only one module (User Module). The basic feature of this API is authoriztion and authentication along with CRUD.

This API include:
1. Signing Up user
2. User Login
3. User role definition
4. JWT token based authentication
5. Authority based on user role
6. Image upload
7. Nodemailer email sender for password reset functionality


// ------------Step 1:
Defining Data

Designing and building userSchema (completed);
Basic routing and controller for CRUD opertion (completed)
Hasing user password for security using bcrypt.hash() (completed)
Checking user existence and comparing user provided password hash with one in database using bcrypt.compare() (completed)


// ----------Step 2:
Error Handling:

Identifying and categorizing erors
Distributing error as Operational or Programming error (its hard to identify programming error, we will work on opertional error)
Handling Async Error using try catch block or creating middleware to handle all async error
Addressing 404 not found error
Responding error according to the mode of development either production or development
Invalid database error (regarding mongodb ID field for routes with id parameter)
Duplicate database field error (For unique index or entity with unique keyword )
Validation error (for required field or field with enum value)
Error outside( Unhandled rejections)
Catching uncaught exception

// ---------------Step 3:
Authorization, Password reset and Node mailer

Generating JWT token 
Storing token in cookies for saftey
Restricting almost every route for not logged in user
Only allowing the owner of account to update or delete themself
Allowing admin to access CRUD over all user where super-admin across admin too
creating forget password route and allowing user to reset password through email verification (Nodemailer);

//----------------Step 4:
Image Upload

image upload using multer


//---------------- Step 5
QRCODE
generting qrcode for each user during signup using qrcode module

// ---------------- Step 6 
Deployment using netlify (Hosting API)