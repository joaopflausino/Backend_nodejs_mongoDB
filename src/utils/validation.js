class Validator {
  static isEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static isUsername(username) {
    if (!username || typeof username !== 'string') return false;
    return username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_]+$/.test(username);
  }

  static isPassword(password) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
  }

  static isPostContent(content) {
    if (!content || typeof content !== 'string') return false;
    return content.trim().length >= 1 && content.length <= 280;
  }

  static isObjectId(id) {
    if (!id) return false;
    const idString = id.toString();
    if (idString.length !== 24) return false;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(idString);
  }

  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  static validateUserData(userData) {
    const errors = [];

    if (!userData.username) {
      errors.push('Username � obrigat�rio');
    } else if (!this.isUsername(userData.username)) {
      errors.push('Username deve ter entre 3-30 caracteres e conter apenas letras, n�meros e underscore');
    }

    if (!userData.email) {
      errors.push('Email � obrigat�rio');
    } else if (!this.isEmail(userData.email)) {
      errors.push('Email deve ter formato v�lido');
    }

    if (!userData.password) {
      errors.push('Password � obrigat�rio');
    } else if (!this.isPassword(userData.password)) {
      errors.push('Password deve ter pelo menos 6 caracteres');
    }

    if (userData.bio && userData.bio.length > 500) {
      errors.push('Bio deve ter no m�ximo 500 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePostData(postData) {
    const errors = [];

    if (!postData.content) {
      errors.push('Conte�do � obrigat�rio');
    } else if (!this.isPostContent(postData.content)) {
      errors.push('Conte�do deve ter entre 1-280 caracteres');
    }

    if (!postData.author) {
      errors.push('Autor � obrigat�rio');
    } else if (!this.isObjectId(postData.author)) {
      errors.push('ID do autor inv�lido');
    }

    if (postData.mentions && Array.isArray(postData.mentions)) {
      const invalidMentions = postData.mentions.filter(id => !this.isObjectId(id));
      if (invalidMentions.length > 0) {
        errors.push('IDs de men��es inv�lidos');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static extractHashtags(text) {
    if (!text || typeof text !== 'string') return [];
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  static extractMentions(text) {
    if (!text || typeof text !== 'string') return [];
    const mentionRegex = /@[\w\u00C0-\u017F]+/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
  }
}

module.exports = Validator;