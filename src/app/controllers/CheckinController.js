import { Op } from 'sequelize';
import { subDays } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinControlller {
    async index(req, res) {
        const { student_id } = req.params;

        const checkin = await Checkin.findAll({
            where: {
                student_id,
            },
            attributes: ['id', 'created_at'],
            include: [
                {
                    model: Student,
                    as: 'student',
                },
            ],
        });

        return res.json(checkin);
    }

    async store(req, res) {
        const { student_id } = req.params;
        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student does not exists' });
        }

        const checkins = await Checkin.findAndCountAll({
            where: {
                student_id,
                created_at: {
                    [Op.between]: [subDays(new Date(), 7), new Date()],
                },
            },
        });

        if (checkins.count >= 5) {
            return res
                .status(400)
                .json('Limit exceeded. You can only check 5 times in a week');
        }

        const checkin = await Checkin.create({
            student_id,
        });

        if (checkins.count >= 1) {
            return res.json(`Você ja fez ${checkins.count} checkin(s) `);
        }

        return res.json(checkin);
    }
}

export default new CheckinControlller();
