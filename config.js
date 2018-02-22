function localConfigurations() {
	return {
		"DB_URL": "localhost",
		"DB_USER": "tuanphung",
		"DB_PASS": "",
		"S3_BUCKET": "caarlyd-dev",
		"CAROUSELL_API": "https://icetea.carousell.com/api/",
		"CAROUSELL_AFFILIATE_ID": "cm",
		"CAROUSELL_AFFILIATE_KEY": "5b9ccc2fac366bbd2f8b5888af8ef749",
		"MORGAN_LOG_FORMAT": ':remote-addr [:date[clf]] :method :url :status :response-time ms - :res[content-length] ":user-agent"',
		"CREDITS_API": "http://api.staging.caarly.com:4007/api/",
        "SMART_SUPPORT_TOKEN": "7ODxFwD5fSJkfWs2gdcDcjRBjGRSrxx8y5KJpTNAEuQK3rKrSwDljC6HAuOx"
    }
}

function developmentConfigurations() {
	return {
		"DB_URL": "10.170.0.4",
		"DB_USER": "postgres",
		"DB_PASS": "CarousellMotors123",
		"S3_BUCKET": "caarlyd-dev",
		"REDIS_SERVER": "10.170.0.4",
		"CAROUSELL_API": "https://icetea.carousell.com/api/",
		"CAROUSELL_AFFILIATE_ID": "cm",
		"CAROUSELL_AFFILIATE_KEY": "5b9ccc2fac366bbd2f8b5888af8ef749",
		"MORGAN_LOG_FORMAT": ':remote-addr [:date[clf]] :method :url :status :response-time ms - :res[content-length] ":user-agent"',
		"CREDITS_API": "http://api.staging.caarly.com:4007/api/",
        "SMART_SUPPORT_TOKEN": "7ODxFwD5fSJkfWs2gdcDcjRBjGRSrxx8y5KJpTNAEuQK3rKrSwDljC6HAuOx"
    }
}

function productionConfigurations() {
	return {
		"DB_URL": "10.190.0.3",
		"DB_USER": "cmotors",
		"DB_PASS": "acWuwqWJqHPFhk3NXusam6wgBxbucE4c",
		"S3_BUCKET": "caarlyd",
		"REDIS_SERVER": "10.190.0.9",
		"CAROUSELL_API": "https://api.carousell.com/api/",
		"CAROUSELL_AFFILIATE_ID": "cm",
		"CAROUSELL_AFFILIATE_KEY": "5b9ccc2fac366bbd2f8b5888af8ef749",
		"MORGAN_LOG_FORMAT": ':remote-addr [:date[clf]] :method :url :status :response-time ms - :res[content-length] ":user-agent"',
		"CREDITS_API": "https://credits.caarly.com/api/",
        "SMART_SUPPORT_TOKEN": "7ODxFwD5fSJkfWs2gdcDcjRBjGRSrxx8y5KJpTNAEuQK3rKrSwDljC6HAuOx"
    }
}

module.exports = function() {
    switch(process.env.NODE_ENV){
        case 'local':
            return localConfigurations();
        case 'development':
        	return developmentConfigurations()
        case 'production':
            return productionConfigurations();

        default:
            return {};
    }
};