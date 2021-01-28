self.slice = [];
self.queue = [];
self.currentWidestFeatureLength = 0;

onmessage = event => {
    if (event.data.type === 'set_slice') {
        self.slice = event.data.slice;
    }
    else if (event.data.type === 'request') {
        if (self.queue.length > 0)
            self.queue = [];

        self.queue.push(event.data);
    }
}

setInterval(() => {
    if (self.queue.length > 0)
        filterData(self.queue.shift());
}, 1);

const filterData = function(payload) {
    // let threshold = 0, max = 0;
   let data = [];
    // let , indices = [];
    if (typeof self.slice[0] != 'undefined') {

        self.currentWidestFeatureLength = Math.max(...self.slice.map(d => {
            return Number(d.FeatureStop) - Number(d.FeatureStart);
        }));

        let underThresholdArray = self.slice.filter(
            d => ( d.index <= payload.first ) && ( d.index >= payload.first - self.currentWidestFeatureLength )
        );

        //Setting and filling the filteredData array with at least one element
        if (underThresholdArray.length !== 0) {

            //If there is at least one data with index < firstNtToDisplay <= index+width
            //then the rightmost one is added to filteredData
            let maxSubIndex = Math.max(...underThresholdArray.map( d => d.index ));

            data = underThresholdArray.filter(
                d => (Number(d.index) === maxSubIndex) //Number() is important here!
            );

        } else {
            //Else filteredData have at least the first data, so that it is never empty
            data = [self.slice[0]]
        }

        //Getting all elements with indices within the desired range
        let elementsWithIndexesWithinWindow = self.slice.filter(
            d => ( Number(d.index) >= payload.first ) && ( Number(d.index) <= payload.last )
        );

        //Adding selected elements to the filteredData array
        elementsWithIndexesWithinWindow.forEach( d => data.push(d) );


        // self.currentWidestFeatureLength = Math.max(...self.slice.map(d => {
        //     return Number(d.FeatureStop) - Number(d.FeatureStart);
        // }));
        //
        // for (let d of self.slice) {
        //     let n = Number(d.index);
        //
        //     if (n <= payload.first && n >= self.currentWidestFeatureLength) {
        //         threshold++;
        //
        //         if (n > max)
        //             max = n;
        //
        //         if (n === max)
        //             data.push(d);
        //     }
        //
        //     if (n >= payload.first && n <= payload.last)
        //         indices.push(d);
        // }
        //
        // if (threshold === 0)
        //     data = [self.slice[0]];
    }

    postMessage(data)
};