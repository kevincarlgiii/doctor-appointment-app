const convertTime = time => {
    //timeParts will return an array
    const timeParts = time.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    let meridiam = 'AM'

    if (hours > 12) {
        meridiam = 'PM'

        if (hours > 12) {
            hours -= 12
        }
    }

    return (
        hours.toString().padStart(2) + 
        ":" +
        minutes.toString().padStart(2, '0') + 
        " " + 
        meridiam
    );
};

export default convertTime;