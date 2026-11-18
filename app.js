const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

let transactionsData = [
    { id: 1, description: 'Paycheck', amount: 1200.00, type: 'income', category: 'salary', date: '2026-11-01' },
    { id: 2, description: 'Rent', amount: 650.00, type: 'expense', category: 'rent', date: '2026-11-01' },
    { id: 3, description: 'Groceries', amount: 54.32, type: 'expense', category: 'food', date: '2026-11-03' },
    { id: 4, description: 'Gas', amount: 38.75, type: 'expense', category: 'transport', date: '2026-11-05' },
    { id: 5, description: 'Spotify', amount: 11.99, type: 'expense', category: 'entertainment', date: '2026-11-06' },
    { id: 6, description: 'Chick-fil-A', amount: 12.48, type: 'expense', category: 'food', date: '2026-11-08' },
    { id: 7, description: 'Tutoring', amount: 80.00, type: 'income', category: 'side-gig', date: '2026-11-10' },
    { id: 8, description: 'Phone bill', amount: 45.00, type: 'expense', category: 'bills', date: '2026-11-12' },
    { id: 9, description: 'New headphones', amount: 89.99, type: 'expense', category: 'shopping', date: '2026-11-14' },
    { id: 10, description: 'Groceries', amount: 41.10, type: 'expense', category: 'food', date: '2026-11-16' }
];
let counter = 11;
app.get('/api/transactions', (req,res)=> {
    const formattedTransaction = transactionsData.map(item => ({
        description: item.description,
        amount : item.amount,
        type : item.type,
        category : item.category,
        date : item.date
    }));
    res.status(200).send(formattedTransaction);
});
app.get('/api/transactions/:id', (req,res) => {
    const { id } = req.params;
    const transactionsId = transactionsData.find((item)=> String(item.id) === id);
    res.status(200).send({
        description: transactionsId.description,
        amount : transactionsId.amount,
        type : transactionsId.type,
        category : transactionsId.category,
        date : transactionsId.date
    })
});
app.post('/api/transactions', (req,res)=> {
    const {description,amount,type,category} = req.body;
    const today = new Date;
    const year = today.getFullYear();
    const month= today.getMonth() + 1;
    const day = today.getDate();
    const date = `${year}-${month}-${day}`;
    if (!description) {
        return res.status(418).send({message : 'We need a description'});
    }
    if (!amount) {
        return res.status(418).send({message : 'We need a amount'});
    }
    if (!type) {
        return res.status(418).send({message : 'We need a type'});
    }
    if (!category) {
        return res.status(418).send({message : 'We need a category'});
    }
    const newTransaction = {
        id : counter,
        description : description,
        amount : amount,
        type : type,
        category : category,
        date : date
    }
    counter++;
    transactionsData.push(newTransaction);
    res.status(201).send(newTransaction);
    
});
app.put('/api/transactions/:id', (req,res)=> {
    const { id } = req.params;
    const {description,amount,type,category} = req.body;
    const index = transactionsData.findIndex((item) => String(item.id) === id);
    if (index === -1) {
        return res.status(404).send({message : 'transaction not found'});
    }
    if (!description) {
        return res.status(400).send({message : 'We need a description'});
    }
    if (!amount) {
        return res.status(400).send({message : 'We need a amount'});
    }
    if (!type) {
        return res.status(400).send({message : 'We need a type'});
    }
    if (!category) {
        return res.status(400).send({message : 'We need a category'});
    }

    const updatedTransaction = {
        id : transactionsData[index].id,
        description : description,
        amount : amount,
        type : type,
        category : category,
        date : transactionsData[index].date
    }
    transactionsData[index] = updatedTransaction;
    res.status(200).send(updatedTransaction);
});
app.delete('/api/transactions/:id', (req,res) => {
    const { id } = req.params;
    
    const index = transactionsData.findIndex((item) => String(item.id) === id);

    transactionsData.splice(index, 1);
    res.status(200).send(transactionsData);
});
app.listen(
    port,
    ()=> console.log(`app is live at http://localhost:${port}`)
);