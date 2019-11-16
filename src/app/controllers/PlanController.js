import Plan from '../models/Plan';

class PlanController {
    async index(req, res) {
        const plans = await Plan.findAll({});

        return res.json(plans);
    }

    async show(req, res) {
        const { id } = req.params;

        const plans = await Plan.findOne({ where: { id } });

        return res.json(plans);
    }

    async store(req, res) {
        const { title } = req.body;

        const planExists = await Plan.findOne({
            where: { title },
        });

        if (planExists) {
            return res.status(400).json({ error: 'Plan already exists' });
        }

        const { id, duration, price } = await Plan.create(req.body);

        return res.json({
            id,
            title,
            duration,
            price,
        });
    }

    async update(req, res) {
        const { id } = req.params;
        const { title } = req.body;

        const plan = await Plan.findOne({ where: { id } });

        if (!plan) {
            return res.status(400).json({ error: 'Plan does not exist' });
        }

        const { duration, price } = await plan.update(req.body);

        return res.json({
            id,
            title,
            duration,
            price,
        });
    }

    async delete(req, res) {
        const { id } = req.params;

        const plan = await Plan.findOne({ where: { id } });

        if (!plan) {
            return res.status(400).json({ error: 'Plan does not exist' });
        }

        await Plan.destroy({ where: { id } });

        return res.json({ success: 'Plan successfully deleted' });
    }
}

export default new PlanController();
