import * as Yup from 'yup';
import { addMonths, startOfDay, parseISO } from 'date-fns';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import CreateEnrollment from '../jobs/CreateEnrollment';

import Queue from '../../lib/Queue';

class EnrollmentController {
    async index(req, res) {
        const { page = 1 } = req.query;

        const enrollment = await Enrollment.findAll({
            attributes: ['id', 'start_date', 'end_date', 'price'],
            order: ['id'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name'],
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: ['id', 'title', 'price'],
                },
            ],
        });

        return res.json(enrollment);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            student_id: Yup.number().required(),
            plan_id: Yup.number().required(),
            start_date: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { student_id, plan_id, start_date } = req.body;

        /**
         * Check if student_id is a student
         */

        const isStudent = await Student.findOne({
            where: { id: student_id },
        });

        if (!isStudent) {
            return res.status(401).json({
                error: 'You can only create enrollments with students',
            });
        }

        /**
         *  Check if student exist
         */
        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student does not exists' });
        }

        /**
         * Check if plan exist
         */
        const plan = await Plan.findByPk(plan_id);

        if (!plan) {
            return res.status(400).json({ error: 'Plan does not exists ' });
        }

        const enrollmentExists = await Enrollment.findOne({
            where: { student_id: req.body.student_id },
        });

        if (enrollmentExists) {
            return res.status(400).json({ error: 'User already exists!' });
        }

        const dateStart = startOfDay(parseISO(start_date));

        const end_date = addMonths(dateStart, plan.duration);
        const price = plan.duration * plan.price;

        const enrollment = await Enrollment.create({
            student_id,
            plan_id,
            start_date: dateStart,
            end_date,
            price,
        });

        const enrollmentData = await Enrollment.findByPk(enrollment.id, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['name', 'email'],
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: ['title', 'duration', 'price'],
                },
            ],
        });

        await Queue.add(CreateEnrollment.key, {
            enrollmentData,
        });

        return res.json(enrollment);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            student_id: Yup.number(),
            plan_id: Yup.number(),
            start_date: Yup.date(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        /**
         * Check Enrollment Exist
         */

        const enrollment = await Enrollment.findByPk(req.params.id);

        if (!enrollment) {
            return res
                .status(400)
                .json({ error: 'Enrollment does not exists' });
        }

        /**
         * Check Plan Exist
         */
        const plan = await Plan.findByPk(req.body.plan_id);

        if (!plan) {
            return res.status(400).json({ error: 'Plan does not exists' });
        }

        /**
         * Check Student Exists
         */

        const student = await Student.findByPk(req.body.student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student does not exists' });
        }

        const { student_id, plan_id, start_date } = req.body;

        const dateStart = startOfDay(parseISO(start_date));

        const end_date = addMonths(dateStart, plan.duration);
        const price = plan.duration * plan.price;

        const enrollmentU = await enrollment.update({
            student_id,
            plan_id,
            start_date: dateStart,
            end_date,
            price,
        });

        return res.json(enrollmentU);
    }

    async delete(req, res) {
        const enrollment = await Enrollment.findByPk(req.params.id);

        if (!enrollment) {
            return res.json('Enrollment does not exists');
        }

        await enrollment.destroy({ where: { id: enrollment.id } });

        return res.json({ sucess: 'Registration successfully deleted' });
    }
}

export default new EnrollmentController();
