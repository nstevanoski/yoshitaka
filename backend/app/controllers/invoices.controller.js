const db = require("../models");
const Invoice = db.memberInvoice;
const Op = db.Op;

const getPagination = (page, size) => {
    const limit = size ? + size : 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: invoices } = data;
    const currentPage = page ? + page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, invoices, totalPages, currentPage };
};

// CREATE Invoice
exports.create = async (req, res) => {
    try {
        const { memberId, paid, amount, paymentStatus, paymentDate } = req.body;

        if (!memberId || !amount || !paymentStatus || !paymentDate) {
            return res.status(400).send({ message: 'All fields are required!' });
        }

        const invoiceObject = {
            memberId,
            paid,
            amount,
            paymentDate
        };

        const createdInvoice = await Invoice.create(invoiceObject);
        return res.json(createdInvoice);
    } catch (error) {
        console.error('Error on invoice: ', error);
        return res.status(400).send({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const id = req.params.member_id; // Extracting the member ID from the request parameters.
        const { page, size, keyword, order_by, payment_status } = req.query; // Extracting query parameters from the request.

        let condition = null;

        if (payment_status) {
            condition = {
                payment_status: payment_status // Exact match on payment_status
            };
        }

        const { limit, offset } = getPagination(page, size); // Helper function to calculate limit and offset for pagination.

        const invoices = await Invoice.findAndCountAll({
            where: {
                member_id: id, // Filter by member ID
                ...condition // Apply additional conditions if a keyword is provided
            },
            order: [['id', order_by || 'asc']], // Sorting by ID in ascending order by default
            limit,
            offset,
        });

        const response = getPagingData(
            invoices,
            page,
            limit
        );

        res.send(response); // Sending the response with the paginated data.
    } catch (err) {
        res.status(400).send(err.message); // Handling errors and sending an error response with a status code of 400.
    }
};

// FIND Invoice
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Invoice.findByPk(id);

        if (!data) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.send({ invoice: data });
    } catch (error) {
        res.status(500).send({
            message: `Error retrieving invoice with id ${id}`
        });
    }
}

// UPDATE Invoice
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { body } = req;

        const [numUpdatedRows] = await Invoice.update(body, {
            where: { id: id }
        });

        if (numUpdatedRows === 1) {
            res.send({
                message: "Invoice was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Invoice with id=${id}. Maybe Invoice was not found or req.body is empty!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Invoice with id=" + id
        });
    }
};

// DELETE Invoice
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        const numDeleted = await Invoice.destroy({
            where: { id: id }
        });

        if (numDeleted === 1) {
            res.send({
                message: "Invoice was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Invoice with id=${id}. Maybe Invoice was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Invoice with id=" + id
        });
    }
};