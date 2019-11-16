import { format, parseISO } from 'date-fns';

import Mail from '../../lib/Mail';

class Answers {
    get key() {
        return 'Answers';
    }

    async handle({ data }) {
        const { helpOrderData } = data;

        Mail.sendMail({
            to: `${helpOrderData.student.name} <${helpOrderData.student.email}>`,
            subject: 'Resposta ref: pedido de auxilio',
            template: 'answer',
            context: {
                student: helpOrderData.student.id,
                name: helpOrderData.student.name,
                email: helpOrderData.student.email,
                question: helpOrderData.question,
                answer: helpOrderData.answer,
                answer_at: format(
                    parseISO(helpOrderData.answer_at),
                    "'dia' dd 'de' MMM', às' H:mm'h'"
                ),
            },
        });
    }
}

export default new Answers();
