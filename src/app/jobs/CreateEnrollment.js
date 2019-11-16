import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class CreateEnrollment {
    get key() {
        return 'CreateEnrollment';
    }

    async handle({ data }) {
        const { enrollmentData } = data;

        Mail.sendMail({
            to: `${enrollmentData.student.name} <${enrollmentData.student.email}>`,
            subject: 'Matrícula concluída com sucesso!',
            template: 'createEnrollment',
            context: {
                student: enrollmentData.student.name,
                email: enrollmentData.student.email,
                plan: enrollmentData.plan.title,
                date_start: format(
                    parseISO(enrollmentData.start_date),
                    "'dia' dd 'de' MMM', às' H:mm'h'"
                ),
                end_date: format(
                    parseISO(enrollmentData.end_date),
                    "'dia' dd 'de' MMM', às' H:mm'h'"
                ),
                price: enrollmentData.price,
            },
        });
    }
}

export default new CreateEnrollment();
