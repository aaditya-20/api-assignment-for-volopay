const csv = require('csv-parser');
const fs = require('fs');
const express = require('express');
const router = express.Router();

// Helper function to filter data based on dates
function filterDataByDate(data, startDate, endDate) {
  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

// Helper function to calculate the total quantity sold
function calculateTotalQuantity(data,department) {
  let totalQuantity = 0;
  data.forEach((item) => {
       
    if(department==item.department){
     
     totalQuantity += parseInt(item.seats);

    }
  });
  return totalQuantity;
}

// Helper function to calculate the total price sold
function calculateTotalPrice(data) {
  let totalPrice = 0;
  data.forEach((item) => {
    totalPrice += parseFloat(item.amount);
  });
  return totalPrice;
}

// Helper function to calculate the Nth most sold item by quantity or price
function calculateNthMostSoldItem(data, item_by, n) {
  const groupedItems = {};
  // console.log(data);
  data.forEach((item) => {
    if (groupedItems[item['software']]) {
      groupedItems[item['software']].quantity += parseInt(item.seats);
      groupedItems[item['software']].price += parseFloat(item.amount);
    } else {
      groupedItems[item['software']] = {
        quantity: parseInt(item.seats),
        price: parseFloat(item.amount),
      };
    }
  });
  // console.log(groupedItems);
  const sortedItems = Object.entries(groupedItems).sort((a, b) => {
    if (item_by === 'quantity') {
      return b[1].quantity - a[1].quantity;
    } else if (item_by === 'price') {
      return b[1].price - a[1].price;
    }
  });
  // console.log(sortedItems.length);
  if(sortedItems.length<n){
    return "not that much elements in the given date range";
  }
  return sortedItems[n - 1][0];
}

// Helper function to calculate the percentage of sold items department-wise
function calculateDepartmentWisePercentage(data) {
  const departmentMap = {};
  data.forEach((item) => {
    if (departmentMap[item.department]) {
      departmentMap[item.department] += parseInt(item.seats);
    } else {
      departmentMap[item.department] = parseInt(item.seats);
    }
  });

  const totalSeats = Object.values(departmentMap).reduce((total, seats) => total + seats, 0);
  const percentageMap = {};

  for (const [department, seats] of Object.entries(departmentMap)) {
    const percentage = ((seats / totalSeats) * 100).toFixed(2);
    percentageMap[department] = `${percentage}%`;
  }

  return percentageMap;
}

// Helper function to calculate the monthly sales for a product
function calculateMonthlySales(data, product, year) {
  const monthlySales = Array(12).fill(0);

  data.forEach((item) => {
    const itemDate = new Date(item.date);
    if (
      item.software.toLowerCase() === product.toLowerCase() &&
      itemDate.getFullYear() === year
    ) {
      const month = itemDate.getMonth();
      monthlySales[month] += parseFloat(item.amount);
    }
  });

  return monthlySales;
}

router.get('/total_items', (req, res) => {
  const { start_date, end_date, department } = req.body;
//  console.log(start_date,end_date,department);
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  // console.log(startDate,endDate,department);
  const data = [];
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      const filteredData = filterDataByDate(data, startDate, endDate);
      const totalItems = calculateTotalQuantity(filteredData,department);
      res.json({ totalItems });
    });
});

router.get('/nth_most_total_item', (req, res) => {
  const { item_by, start_date, end_date, n } = req.body;

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  const data = [];
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      const filteredData = filterDataByDate(data, startDate, endDate);
      const nthMostSoldItem = calculateNthMostSoldItem(filteredData, item_by, n);
      res.json({ nthMostSoldItem });
    });
});

router.get('/percentage_of_department_wise_sold_items', (req, res) => {
  const { start_date, end_date } = req.body;

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  const data = [];
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      const filteredData = filterDataByDate(data, startDate, endDate);
      const departmentWisePercentage = calculateDepartmentWisePercentage(filteredData);
      res.json(departmentWisePercentage);
    });
});

router.get('/monthly_sales', (req, res) => {
  const { product, year } = req.body;

  const data = [];
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      const monthlySales = calculateMonthlySales(data, product, parseInt(year));
      res.json(monthlySales);
    });
});

module.exports = router;
