import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
    async index(req, res) {
        const { page = 1 } = req.query;

        const helpOrder = await HelpOrder.findAll({
            where: { answer: null },
            order: ['created_at'],
            limit: 20,
            offset: (page - 1) * 20,
        });

        return res.json(helpOrder);
    }

    async show(req, res) {
        const { student_id } = req.params;

        const helpOrder = await HelpOrder.findAll({ where: { student_id } });
        return res.json(helpOrder);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            question: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { student_id, question } = req.body;

        /*
         *   Check if student exist
         */

        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student does not exist' });
        }

        const helpOrder = await HelpOrder.create({
            student_id,
            question,
        });

        return res.json(helpOrder);
    }
}

export default new HelpOrderController();
