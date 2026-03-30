const Dynamic_calculator = async(req,res)=>{
    //Dynamic Calculation
    let base_price = 55;

    //Location Multiplier
    const Location_data = new Map();
    Location_data.set("Delhi",1.4);
    Location_data.set("Mumbai",1.3);
    Location_data.set("Chennai",1.3);
    Location_data.set("Pune",0.8);

    //Season Multiplier
    const Months = new Map();
    Months.set("June",1.3);
    Months.set("July",1.3);
    Months.set("August",1.3);
    Months.set("September",1.3);
    Months.set("March",1.15);
    Months.set("April",1.15);
    Months.set("May",1.15);
    Months.set("January",0.85);
    Months.set("February",0.85);
    Months.set("December",0.85);


    //Experience Multiplier
    
    

}
module.exports = Dynamic_calculator;