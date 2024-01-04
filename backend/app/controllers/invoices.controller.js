const db = require("../models");
const Invoice = db.memberInvoice;
const Service = db.invoiceService;
const Member = db.member;
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
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).send({ message: 'Something went wrong, member ID is required!' });
        }

        const invoiceObject = {
            memberId,
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
        const id = req.params.member_id;
        const { page, size, keyword, order_by, payment_status } = req.query;

        let condition = null;

        // if (payment_status) {
        //     condition = {
        //         payment_status: payment_status
        //     };
        // }

        const { limit, offset } = getPagination(page, size);

        const member = await Member.findByPk(id);
        const invoicesWithServices = await Invoice.findAndCountAll({
            where: {
                member_id: id,
                ...condition
            },
            order: [['id', order_by || 'asc']],
            limit,
            offset,
            include: [{ model: Service, as: 'services' }] // Include associated services
        });

        const invoices = invoicesWithServices.rows.map(invoice => {
            const isPaid = invoice.services.every(service => service.left_to_be_paid === 0);
            const status = isPaid ? "PAID" : "UNPAID";
            const leftAmount = invoice.services.reduce((acc, service) => acc + service.left_to_be_paid, 0);

            return {
                ...invoice.get(),
                status,
                left_amount: leftAmount
            };
        });

        const response = getPagingData(
            { count: invoicesWithServices.count, rows: invoices },
            page,
            limit
        );

        res.send(Object.assign(response, { member }));
    } catch (err) {
        res.status(400).send(err.message);
    }
};


// FIND Invoice
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Invoice.findByPk(id, { include: [{ association: "services" }] });

        if (!data) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const member = await Member.findByPk(data.memberId);

        // Check if all services have left_to_be_paid equal to 0
        const isPaid = data.services.every(service => service.left_to_be_paid === 0);

        // Determine the status based on the result
        const status = isPaid ? "PAID" : "UNPAID";

        res.send({ invoice: data, member, status });
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

exports.createService = async (req, res) => {
    try {
        const memberInvoiceId = req.params.invoice_id;
        const services = req.body;

        if (!memberInvoiceId || !services || !Array.isArray(services) || services.length === 0) {
            return res.status(400).send({ message: 'Something went wrong, provide a valid array of services!' });
        }

        const createdServices = [];

        for (const service of services) {
            const { service_name, has_paid, amount } = service;

            if (!service_name || !has_paid || !amount) {
                return res.status(400).send({ message: 'All fields are required for each service!' });
            }

            const serviceObject = {
                memberInvoiceId,
                service_name,
                has_paid,
                amount,
                left_to_be_paid: amount - has_paid
            };

            const createdService = await Service.create(serviceObject);
            createdServices.push(createdService);
        }

        return res.json(createdServices);
    } catch (error) {
        console.error('Error on invoice: ', error);
        return res.status(400).send({ message: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const serviceUpdates = req.body;
        const memberInvoiceId = req.params.invoice_id;

        if (!Array.isArray(serviceUpdates) || serviceUpdates.length === 0) {
            return res.status(400).send({ message: 'Provide a valid array of service updates!' });
        }

        const updatedServices = [];
        const createdServices = [];

        for (const update of serviceUpdates) {
            const { id } = update;

            try {
                if (id) {
                    // Update existing service
                    const [numUpdatedRows] = await Service.update(update, {
                        where: { id: id }
                    });

                    if (numUpdatedRows === 1) {
                        updatedServices.push(id);
                    }
                } else {
                    update.memberInvoiceId = memberInvoiceId;
                    update.left_to_be_paid = update.amount - update.has_paid;

                    const createdService = await Service.create(update);
                    createdServices.push(createdService.id);
                }
            } catch (updateError) {
                console.error('Error updating/creating a service: ', updateError);
                throw new Error('Error updating/creating services. See logs for details.');
            }
        }

        return res.json({
            message: "Services were updated and created successfully.",
            updatedServices,
            createdServices
        });
    } catch (error) {
        console.error('Error updating/creating services: ', error);
        return res.status(500).send({ message: error.message || "Error updating/creating services." });
    }
};

