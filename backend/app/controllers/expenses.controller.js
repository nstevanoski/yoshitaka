const db = require("../models");
const Expense = db.expense;
const Op = db.Op;

const getPagination = (page, size) => {
    const limit = size ? + size : 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: expenses } = data;
    const currentPage = page ? + page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, expenses, totalPages, currentPage };
};

exports.create = async (req, res) => {
    try {
        const { name, amount } = req.body;

        if (!name || !amount) {
            return res.status(400).send({ message: 'All fields are required!' });
        }

        const expenseObject = {
            name,
            amount
        };

        const createdExpense = await Expense.create(expenseObject);
        return res.json(createdExpense);
    } catch (error) {
        console.error('Error on expense: ', error);
        return res.status(400).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { body } = req;

        const [numUpdatedRows] = await Expense.update(body, {
            where: { id: id }
        });

        if (numUpdatedRows === 1) {
            res.send({
                message: "Expense was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Expense with id=${id}. Maybe Expense was not found or req.body is empty!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Expense with id=" + id
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        const numDeleted = await Expense.destroy({
            where: { id: id }
        });

        if (numDeleted === 1) {
            res.send({
                message: "Expense was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Expense with id=${id}. Maybe Expense was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Expense with id=" + id
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const { page, size, keyword, order_by } = req.query;
        const condition = keyword ? { name: { [Op.like]: `%${keyword}%` } } : null;

        const { limit, offset } = getPagination(page, size);

        const result = await Expense.findAndCountAll({
            where: condition,
            order: [['id', order_by ? order_by : 'asc']],
            limit,
            offset
        });

        const response = getPagingData(result, page, limit);
        res.send({ data: response });
    } catch (err) {
        res.status(400).send(err.message);
    }
};