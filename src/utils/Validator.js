class Validator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateRequired(value, fieldName) {
        if (!value || value.toString().trim() === '') {
            throw new Error(`Campo obrigatório: ${fieldName}`);
        }
        return true;
    }

    static validateStringLength(value, fieldName, minLength = 1, maxLength = 255) {
        if (value.length < minLength || value.length > maxLength) {
            throw new Error(`${fieldName} deve ter entre ${minLength} e ${maxLength} caracteres`);
        }
        return true;
    }

    static validatePostContent(content) {
        this.validateRequired(content, 'conteúdo da postagem');
        this.validateStringLength(content, 'conteúdo da postagem', 1, 280);
        return true;
    }

    static validateUserData(userData) {
        this.validateRequired(userData.username, 'username');
        this.validateRequired(userData.email, 'email');
        this.validateStringLength(userData.username, 'username', 3, 30);

        if (!this.validateEmail(userData.email)) {
            throw new Error('Email inválido');
        }

        return true;
    }

    static validatePassword(password) {
        this.validateRequired(password, 'password');

        if (password.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }

        if (password.length > 100) {
            throw new Error('Senha deve ter no máximo 100 caracteres');
        }

        return true;
    }
}
module.exports = Validator;