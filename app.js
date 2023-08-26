import express from 'express';
import bodyParser from 'body-parser';
import { keyAuthentication } from './middlewares/key.middlware.js';
import { StatusCodes } from 'http-status-codes';

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
    },
];

app.post('/register', keyAuthentication, (req, res) => {
    const newUser = req.body;

    if (Object.keys(newUser).length === 0) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid request body, Please provide name and email' });
    }

    for (let user of registeredUsers) {
        if (user.email === newUser.email) {
            return res.status(StatusCodes.CONFLICT).json({ error: 'User already exists!!' });
        }
    }
    registeredUsers = [
        ...registeredUsers,
        { id: registeredUsers.length + 1, name: newUser.name, email: newUser.email },
    ];
    console.log(registeredUsers);

    return res.status(StatusCodes.CREATED).json({ message: 'User created successfully !!' });
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
