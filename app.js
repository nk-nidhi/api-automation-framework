import express from 'express';
import bodyParser from 'body-parser';
import { keyAuthentication } from './middlewares/key.middlware.js';
import { StatusCodes } from 'http-status-codes';
import { TokenManager } from './utils/token.manager.js';
import { CypherManager } from './utils/cypher.manager.js';
import { tokenAuthentication } from './middlewares/auth.middleware.js';
import { v4 as uniqueId } from 'uuid';

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

const actionables = [
    {
        id: uniqueId(),
        title: 'title1',
        description: 'desc1',
    },
    {
        id: uniqueId(),
        title: 'title2',
        description: 'desc2',
    },
];

let registeredUsers = [
    {
        id: 1,
        name: 'tvuser',
        email: 'tvuser101@gmail.com',
        password: '$2b$10$rGuXFY6RIFC6l6dFP8E1nej5w.Tj80OKUl2ntKLre5rc/yWzzCJC2', // tv101
    },
];

app.post('/register', keyAuthentication, async (req, res) => {
    const newUser = req.body;

    if (!newUser.name || !newUser.email || !newUser.password || Object.keys(newUser).length === 0) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid request body, Please prvide name, email and password' });
    }

    const existingUser = registeredUsers.find((user) => user.email === newUser.email);
    if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json({ error: 'User already exists' });
    }

    const encryptedPassword = await CypherManager.encrypt(newUser.password);

    const user = {
        id: registeredUsers.length + 1,
        name: newUser.name,
        email: newUser.email,
        password: encryptedPassword,
    };

    registeredUsers = [...registeredUsers, { ...user }];
    const token = TokenManager.generateToken(user);

    return res.status(StatusCodes.CREATED).json({ message: 'User created successfully !!', token });
});

app.post('/login', async (req, res) => {
    const userProfile = req.body;

    if (!userProfile.email || !userProfile.password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid request body, Please provide email and password' });
    }

    let [registeredUser, isRegisteredUser] = [null, false];

    for (let user of registeredUsers) {
        if (user.email !== userProfile.email) {
            continue;
        }
        const checkPassed = await CypherManager.decrypt(userProfile.password, user.password);
        if (!checkPassed) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Incorrect credential' });
        isRegisteredUser = true;
        registeredUser = user;
        break;
    }

    if (!isRegisteredUser) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'User is not registered !!' });
    }
    const token = TokenManager.generateToken(registeredUser);
    return res.status(StatusCodes.OK).json({ message: 'User logged-in successfully !!', token });
});

// Create
app.post('/action-items/add', tokenAuthentication, (req, res) => {
    const user = req.user;
    const newItem = req.body;

    if (!newItem.title || !newItem.description) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid request body, Please provide title and description' });
    }
    const newItemToBeCreated = { id: uniqueId(), ...newItem };

    actionables.push(newItemToBeCreated);
    res.status(201).json({ user: user.name, item: newItemToBeCreated });
});

// Read
app.get('/action-items/retrieve', (req, res) => {
    res.json(actionables);
});

// Update action
app.put('/action-items/update/:id', tokenAuthentication, (req, res) => {
    const actionId = req.params.id;
    const actionUpdates = req.body;
    const user = req.user;

    if (!actionUpdates.title || !actionUpdates.description) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid request body, Please provide title and description' });
    }

    const actionIndexToBeUpdated = actionables.findIndex((action) => action.id === actionId);

    if (actionIndexToBeUpdated === -1) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Action Item not found !!' });
    }

    actionables[actionIndexToBeUpdated].title = actionUpdates.title;
    actionables[actionIndexToBeUpdated].description = actionUpdates.description;

    return res.status(StatusCodes.OK).json({
        message: 'Action details updated successfully !!',
        user: user.name,
        updated_action: actionables[actionIndexToBeUpdated],
    });
});

app.delete('/action-items/delete/:id', tokenAuthentication, (req, res) => {
    const actionId = req.params.id;
    const user = req.user;

    const actionItemIndex = actionables.findIndex((actionItem) => actionItem.id === actionId);

    if (actionItemIndex === -1) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Action Item not found !!' });
    }

    const deletedActionItem = actionables.splice(actionItemIndex, 1);
    return res
        .status(StatusCodes.OK)
        .json({ message: 'Action item deleted successfully !!', user: user.name, deleted_item: deletedActionItem });
});

app.use((req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'endpoint not found !!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
