const db = require("../models");
const Member = db.member;
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
    const { first_name, last_name, email, has_paid, left_to_be_paid, total_sum, belt_color, last_paid } = req.body;

    if (!first_name || !last_name || !has_paid || !total_sum || !belt_color) {
      return res.status(400).send({ message: 'All fields are required!' });
    }

    const memberExists = await Member.findOne({ where: { first_name, last_name } });
    if (memberExists) {
      return res.status(400).send({ message: 'Member already exists.' });
    }

    const memberObject = {
      first_name,
      last_name,
      email,
      has_paid,
      left_to_be_paid,
      total_sum,
      belt_color,
      last_paid
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
      order: [['id', order_by || 'asc']],
      limit,
      offset,
    });

    const currentDate = new Date();
    const membersWithPaymentStatus = members.rows.map(member => {
      const paid = (member.last_paid >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) && (member.left_to_be_paid == null);
      return {
        ...member.toJSON(),
        paid,
      };
    });

    const response = getPagingData(
      { count: members.count, rows: membersWithPaymentStatus },
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
    const data = await Member.findByPk(id);
    
    if (!data) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const currentDate = new Date();
    const paid = (data.last_paid >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) && (data.left_to_be_paid == null);
    const memberWithPaymentStatus = {
      ...data.toJSON(),
      paid,
    };

    res.send({ member: memberWithPaymentStatus });
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