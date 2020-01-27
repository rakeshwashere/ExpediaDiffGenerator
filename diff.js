//READ FILE FROM SYSTEM
const fs = require('fs')
const IGNORED_FIELDS = new Set(['sortPosition', 'hotelFee']);

const generateBEXMap = (bEXList) => {
    console.log(`The length of the list is : ${bEXList.length}`)
    const productIdToDetailsMap = {};
    bEXList.forEach(bEX => {
        const {
            productId
        } = bEX
        productIdToDetailsMap[productId] = bEX;
    });
    return productIdToDetailsMap;
}

const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;

const isProductDifferent = (firstProduct, secondProduct, jsonPath) => {
    for (const key in firstProduct) {
        if(IGNORED_FIELDS.has(key)) {
            continue;
        }
        
        newJsonPath = Array.from(jsonPath);
        newJsonPath.push(key);

        if(isObject(firstProduct[key]) && isProductDifferent(firstProduct[key], secondProduct[key], newJsonPath)) {
            return true;
        }

        if (!isObject(firstProduct[key]) &&
            firstProduct[key] &&
            secondProduct[key] &&
            (firstProduct[key] !== secondProduct[key])) {
            console.log(`${newJsonPath.join(' -> ')} : ${firstProduct[key]} vs ${secondProduct[key]} `)
            return true;
        }
    }
}

const findDiffProducts = (bffList, bEXMap) => {
    const diffList = [];
    let numOfDifferentProducts = 0;
    bffList.forEach(bff => {
        const {
            productId
        } = bff;

        const matchingBEX = bEXMap[productId];
        if (matchingBEX !== undefined) {
            if (isProductDifferent(bff, matchingBEX, [`productId: ${productId}`])) {
                numOfDifferentProducts++;
                diffList.push(bff);
            }
        } else {
            console.error(`No matching product found in BexMap for productId: ${productId}`)
        }
    });

    console.log(`The number of diff objects is ${numOfDifferentProducts}`);
    return diffList;å
}

let bEXList = JSON.parse(fs.readFileSync('SRP_BEX.json', 'utf-8'));
let bffList = JSON.parse(fs.readFileSync('SRP_BFF.json', 'utf-8'));

const bEXMap = generateBEXMap(bEXList);
const diffList = findDiffProducts(bffList, bEXMap);
const OUTPUT_DIR = 'diff-output';

if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR);
}

const dateNow = new Date();

fs.writeFileSync(`${OUTPUT_DIR}/diff-${dateNow.toISOString()}.json`, JSON.stringify(diffList, null ,2));