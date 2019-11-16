import * as Yup from 'yup';
import Queue from '../../lib/Queue';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Answers from '../jobs/Answers';

class AnswerController {
    async store(req, res) {
        const schema = Yup.object().shape({
            answer: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation failed' });
        }

        const { id } = req.params;
        const { answer } = req.body;

        const helpOrder = await HelpOrder.findByPk(id, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        if (helpOrder.answer_at) {
            return res
                .status(401)
                .json({ error: 'You can only answer a help order once' });
        }

        await helpOrder.update({ answer, answer_at: new Date() });
        await helpOrder.save();

        const helpOrderData = await HelpOrder.findByPk(helpOrder.id, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        await Queue.add(Answers.key, {
            helpOrderData,
        });

        return res.json(helpOrder);
    }
}

export default new AnswerController();
