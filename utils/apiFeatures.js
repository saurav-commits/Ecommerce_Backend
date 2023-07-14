// this we r doing for using search function

class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
        ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",
            },
        }
        : {};

        this.query = this.query.find({...keyword});
        return this;
        }


        filter() {
            // here we are making a copy of the queryStr so that it does not change the actual queryStr
            const queryCopy = {...this.queryStr}

            // removing some fields for category
            const removeFields = ["keyword","page","limit"];
            removeFields.forEach(key => delete queryCopy[key]);
                
            // whenever we use this.query we must relate it to like we are querying find() in mongodb
            this.query = this.query.find(queryCopy);
            return this;

            // filtering price 
            let queryStr = JSON.stringify(queryCopy);
            queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

            this.query = this.query.find(JSON.parse(queryStr));

            return this;
        }

        pagination(resultPerPage) {
            const currentPage = Number(this.queryStr.page) || 1    // take for example we have 10 items per page and we have 50 items as whole so we will se 50-10 per page
            const skip = resultPerPage * (currentPage-1); // so if we want to see the 2nd page we will put value of current Page 2 and we will get 2-1*10 and we will skip first 10 products.
            this.query = this.query.limit(resultPerPage).skip(skip);
            return this;
        }
}

module.exports = ApiFeatures;

