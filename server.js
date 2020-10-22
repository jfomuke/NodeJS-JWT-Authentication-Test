// Since the token is hardcored then it wont work proper
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

app.use((req, res, next) => 
{
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

// Needs body parser to sift thru data when post it sent
const bodyParser = require('body-parser');
const path = require('path');
// Port to serve the server on for localhost
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const secretKey = 'My super secret key';
const jwtMW = exjwt
({
    secret: secretKey,
    algorithms: ['HS256']
});
let users = 
[
    {
        id: 1,
        username: 'fabio',
        password: '123'
    },
    {
        id: 2,
        username: 'nolasco',
        password: '456'
    },
];

// Linked to axios.post in index.html - it sends a post request, this receives it, sends data
app.post('/api/login', (req, res) => 
{
    const { username, password } = req.body
    //console.log("This is me", username, password);
    //res.json({data: 'it works'});

    // check is array user that we created matches the given info
    for (let user of users) 
    {
        if (username == user.username && password == user.password)
        { // successful login
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
            res.json
            ({
                success: true,
                err: null,
                token
            });
            break;
        }
        else
        {
            // if the username and password dont match then pass an error page
            res.status(401).json
            ({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
});

// jwtMW is middleware to protect the route dashboard - makes it only accessible if they have a valid jwt
// the valid jwt is given by the jwt and verified by exjwt/jwtMW
app.get('/api/dashboard', jwtMW, (req, res) => 
{
    console.log(req);
    res.json
    ({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});

// New endpoint - its a protected route since it uses jwtMW
app.get('/api/prices', jwtMW, (req, res) => 
{
    console.log(req);
    res.json
    ({
        success: true, // success can be substituted with anything - didItWork: true - anything in the json payloads can be modified 
        myContent: 'This is the price $3.99'
    });
});

/* _________________________________________________________________________*/
app.get('/api/settings', jwtMW, (req, res) => 
{
    
    console.log(req);
    res.json
    ({
        success: true,
        textMessage: 'This is the settings route that you can only see with a bearer token :D',
        yeehaw: true
    });
});


app.get('/', (req, res) => 
{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    // if the error name is UnauthorizedError then respond in a specific way
    if (err.name === 'UnauthorizedError') 
    {
        res.status(401).json
        ({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else
    {
        next(err);
    }
});

app.listen(PORT, () => 
{
    console.log('Serving on port ${PORT} 3000');
});