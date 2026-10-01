import http from '@/api/http';
import { LoginResponse } from '@/api/auth/login';

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    recaptchaData?: string | null;
    referralCode?: string | null;
}

export default ({ username, email, password, passwordConfirmation, recaptchaData, referralCode }: RegisterData): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/register', {
            username,
            email,
            password,
            password_confirmation: passwordConfirmation,
            'g-recaptcha-response': recaptchaData,
            referral_code: referralCode || undefined,
        })
            .then(({ data }) => {
                if (!(data instanceof Object)) {
                    return reject(new Error('An error occurred while processing the registration request.'));
                }

                return resolve({
                    complete: data.complete,
                    intended: data.intended || undefined,
                });
            })
            .catch(reject);
    });
};
