import express from 'express';
import bodyParser from 'body-parser';
import { keyAuthentication } from './middlewares/key.middlware.js';
import { StatusCodes } from 'http-status-codes';
import { AuthenticationService } from './utils/authentication.service.js';
import { CypherService } from './utils/cypher.service.js';

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

const items = [
    {
        id: 1,
        title: 'title1',
        description: 'desc1',
    },
    {
        id: 2,
        title: 'title2',
        description: 'desc2',
    },
];

let registeredUsers = [
    {
        id: 1,
        name: 'tvuser',
        email: 'tvuser101@gmail.com',
        password: 'tv101',
    },
];

app.post('/register', keyAuthentication, async (req, res) => {
    const newUser = req.body;

    if (Object.keys(newUser).length === 0) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ Error: 'Invalid request body, Please provide name and email' });
    }

    for (let user of registeredUsers) {
        if (user.email === newUser.email) {
            return res.status(StatusCodes.CONFLICT).json({ Error: 'User already exists!!' });
        }
    }
    // Check if user with same email exists
    // const existingUser = registeredUsers.find((user) => user.email === newUser.email);
    // if (existingUser) {
    //     return res.status(StatusCodes.CONFLICT).json({ Error: 'User already exists' });
    // }

    const encryptedPassword = await CypherService.encrypt(newUser.password);
    console.log('encryptedPassword = ', encryptedPassword);
    const user = {
        id: registeredUsers.length + 1,
        name: newUser.name,
        email: newUser.email,
        password: encryptedPassword,
    };

    registeredUsers = [...registeredUsers, { ...user }];
    const token = AuthenticationService.generateToken(user);

    console.log({ registeredUsers, token });
    return res.status(StatusCodes.CREATED).json({ Message: 'User created successfully !!', token });
});

app.get('/login', async (req, res) => {
    const userProfile = req.body;

    if (!userProfile.email || !userProfile.password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ Error: 'Invalid request body' });
    }
    let registeredUser;
    let isExistingUser = false;
    
    for (let user of registeredUsers) {
        if (user.email !== userProfile.email) {
            continue;
        }
        const checkPassed = await CypherService.decrypt(userProfile.password, user.password);
        if (!checkPassed) return res.status(StatusCodes.BAD_REQUEST).json({ Error: 'Incorrecr credential' });
        isExistingUser = true;
        registeredUser = user;
        break;
    }

    if (!isExistingUser) {
        return res.status(StatusCodes.NOT_FOUND).json({ Error: 'User is not registered !!' });
    }
    const token = AuthenticationService.generateToken(registeredUser);
    return res.status(StatusCodes.OK).json({ Message: 'User logged-in successfully !!', token });
});

// Create
app.post('/items', (req, res) => {
    const newItem = req.body;
    items.push(newItem);
    res.status(201).json(newItem);
});

// Read
app.get('/items', (req, res) => {
    res.json(items);
});

// Update
app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id); // 1
    const updatedItem = req.body; //

    if (itemId > 0 && itemId < items.length) {
        items[itemId] = updatedItem;
        res.json(updatedItem);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Delete
app.delete('/items/:id', (req, res) => {
    const itemId = req.params.id;

    if (itemId > 0 && itemId < items.length) {
        const deletedItem = items.splice(itemId, 1);
        res.json(deletedItem[0]);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
