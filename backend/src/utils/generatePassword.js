export function generateRandomPassword(length = 10) {
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-='
  };

  const all = charset.uppercase + charset.lowercase + charset.numbers + charset.symbols;
  
  let password = '';
  // Aseguramos al menos un carácter de cada tipo
  password += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
  password += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));
  password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
  password += charset.symbols.charAt(Math.floor(Math.random() * charset.symbols.length));

  // Rellenamos el resto
  for (let i = password.length; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Mezclamos el orden
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default { generateRandomPassword };