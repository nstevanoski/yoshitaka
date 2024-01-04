const db = require("../models");
const Member = db.member;
const Invoice = db.memberInvoice;
const Service = db.invoiceService;
const Op = db.Op;

const getPagination = (page, size) => {
  const limit = size ? + size : 10;
  const offset = page ? (page - 1) * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: members } = data;
  const currentPage = page ? + page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, members, totalPages, currentPage };
};

// CREATE MEMBER
exports.create = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).send({ message: 'All fields are required!' });
    }

    const memberExists = await Member.findOne({ where: { email } });
    if (memberExists) {
      return res.status(400).send({ message: 'Member already exists.' });
    }

    const memberObject = {
      first_name,
      last_name,
      email,
    };

    const createdMember = await Member.create(memberObject);
    return res.json(createdMember);
  } catch (error) {
    console.error('Error on member: ', error);
    return res.status(400).send({ message: error.message });
  }
};


exports.getAll = async (req, res) => {
  try {
    const { page, size, keyword, order_by } = req.query;

    let condition = null;

    if (keyword) {
      condition = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${keyword}%` } },
          { last_name: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }

    const { limit, offset } = getPagination(page, size);

    const members = await Member.findAndCountAll({
      where: condition,
      order: [['id', order_by || 'desc']],
      limit,
      offset,
      include: [{ association: "invoices", include: [{ association: "services" }] }],
    });

    // Calculate the total sum of left_to_be_paid for each member
    const membersWithTotalLeftToBePaid = members.rows.map((member) => {
      const totalLeftToBePaid = member.invoices.reduce((sum, invoice) => {
        return sum + invoice.services.reduce((serviceSum, service) => {
          return serviceSum + (service.left_to_be_paid || 0);
        }, 0);
      }, 0);
      return { id: member.id, first_name: member.first_name, last_name: member.last_name, email: member.email, total_left_to_be_paid: totalLeftToBePaid };
    });

    const response = getPagingData(
      { count: members.count, rows: membersWithTotalLeftToBePaid },
      page,
      limit
    );

    res.send({ data: response });
  } catch (err) {
    res.status(400).send(err.message);
  }
};


// FIND MEMBER
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Member.findByPk(id, {include: [{association: "invoices"}]});
    
    if (!data) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.send({ member: data });
  } catch (error) {
    res.status(500).send({
      message: `Error retrieving member with id ${id}`
    });
  }
}

// UPDATE MEMBER
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { body } = req;

    const [numUpdatedRows] = await Member.update(body, {
      where: { id: id }
    });

    if (numUpdatedRows === 1) {
      res.send({
        message: "Member was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Member with id=${id}. Maybe Member was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Member with id=" + id
    });
  }
};

const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file attached' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'stevanoski.nikola@uklo.edu.mk',
        pass: 'usxmngijmzjuudfh',
      },
    });

    const mailOptions = {
      from: 'stevanoski.nikola@uklo.edu.mk',
      to: email,
      subject: subject,
      html: message,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer, // Assuming 'file.buffer' contains the file content
        },
      ],
    };

    console.log(file);

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

// DELETE MEMBER
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const numDeleted = await Member.destroy({
      where: { id: id }
    });

    if (numDeleted === 1) {
      res.send({
        message: "Member was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Member with id=${id}. Maybe Member was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Member with id=" + id
    });
  }
};

exports.unpaidInvoicesReport = async (req, res) => {
  try {
    const unpaidInvoices = await Member.findAll({
      include: [
        {
          model: Invoice,
          as: 'invoices',
          include: [{ model: Service, as: 'services' }]
        }
      ],
      where: {
        // Additional condition for members, if needed
      }
    });

    const reportData = unpaidInvoices
      .filter(member => {
        // Filter out members with all paid services
        return member.invoices.some(invoice =>
          invoice.services.some(service => service.left_to_be_paid > 0)
        );
      })
      .map(member => {
        const unpaidInvoicesForMember = member.invoices.filter(invoice => {
          const isUnpaid = invoice.services.some(service => service.left_to_be_paid === 0);
          return isUnpaid;
        });

        return {
          member_id: member.id,
          member_full_name: `${member.first_name} ${member.last_name}`, 
          unpaid_invoices: unpaidInvoicesForMember.map(invoice => ({
            invoice_id: invoice.id,
            status: "UNPAID"
          }))
        };
      });

    res.send(reportData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
