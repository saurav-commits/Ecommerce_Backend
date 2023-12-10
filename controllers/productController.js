const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");


// create a product
exports.createProduct = catchAsyncErrors(async (req, res) => {

    req.body.user = req.user.id; 
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})



exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    const resultPerPage=5;
    const produtCount = await product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products,
        produtCount
    });
})

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (err) {
        next(err); // Pass the error to the error-handling middleware
    }
};




exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(201).json({
        success: true,
        message: "Product updated successfully",
        product
    })

})


exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(500).json({ success: false, message: "No such product found" });

    await Product.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({ success: true, message: "Product successfully deleted" })

})


// create new product review or update the review

exports.createProductReview = catchAsyncErrors(async(req, res, next)=>{
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if(isReviewed) {
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);        
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }


    let avg=0;
    product.ratings = product.reviews.forEach((rev) => {
        avg += rev.rating;
    }) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    })
})

// delete review 

exports.deleteReview = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter((rev)=> rev._id.toString() !== req.query.id.toString())

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    const ratings = avg/reviews.length;
    const numOfReviews = reviews.length;

    await product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews, 
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        } 
    );

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})
