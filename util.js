module.exports.getResponse = ({ longUrl, shortUrl }) => ({
	original_url: longUrl,
	short_url: shortUrl,
});

module.exports.makeShortUrl = longUrl => {
	const chars = longUrl.replace(/[htt|ftp?s\W_w{3}]/g, '') + Date.now();
	const randomIndex = () => Math.floor(Math.random() * chars.length);

	let word = '';
	for (let i = 0; i < 5; i++) {
		word += chars.charAt(randomIndex());
	}

	return word;
};