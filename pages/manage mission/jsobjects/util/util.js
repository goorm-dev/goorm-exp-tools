export default {
	INSERT_BATCH_SIZE: 10,
	
	basic: {
		str: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		len: 18,
	},

	makeRandomIdWithPrefix: (
		prefix,
		length =  util.basic.len
	)=> {
		const id = index_browser_js.customAlphabet(util.basic.str, length);

		const randomId = id();

		return `${prefix}_${randomId}`;
	},
	
	makeRandomId: (length =  util.basic.len) => {
		const id = index_browser_js.customAlphabet(util.basic.str, length);
		return id();
	},
	
	getMongoDbDate: (date = new Date()) => {
		return {
			"$date": date
		}
	},
	
	getToday: () => {
		return new Date();
	}
}