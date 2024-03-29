import React from 'react';

import {DropdownSelector, WithEndpoint, TitleCard, OdinGraph, StatusBox} from 'odin-react';
import {Dropdown, Row, Col, Alert} from 'react-bootstrap';

import Mermaid from "./Mermaid";

const ClkgenEndpointDropdown = WithEndpoint(DropdownSelector);

export function StatusBadge(_ref) {
    let label = _ref.label;
    let type = _ref.type;
    if (type === null || typeof type === 'undefined') {
        type = "primary";
    }
    let wrap = _ref.wrap;
    if (wrap === null || typeof wrap === 'undefined') {
        wrap = false
    }

    var fullclass = "badge bg-"+type + " " + (wrap ? "text-wrap" : "");
    return (
        <span class={fullclass}>{label}</span>
    )
}

export function LOKIConnectionAlert({adapterEndpoint, loki_connection_state, set_loki_connection_state}) {
    // Carrier info should always be present, no matter the contro l system config
    let toplevel = adapterEndpoint.data?.carrier_info;

    if (typeof toplevel === 'undefined') {
        if (loki_connection_state) {
            // LOKI has just lost connection
            set_loki_connection_state(false);
        }
    } else {
        if (!loki_connection_state) {
            // LOKI has just retained connection
            set_loki_connection_state(true);
        }
    }

    return (
        <Alert variant='warning' show={!loki_connection_state} >
            The connection to LOKI has been lost!
        </Alert>
    )
}

export function LOKIClockGenerator({adapterEndpoint}) {
    // Element to display current clock configuration selection, and allow the selection of another.
    // Periodic endpoint used for getting the driver name
    //const clkgenEndpoint = useAdapterEndpoint("detector/clkgen", api_addr);

    let currently_selected = adapterEndpoint.data.clkgen?.config_file;

    // Map each available option to a dropdown option
    let all_options = adapterEndpoint.data.clkgen?.config_files_avail;
    let options;
    if (typeof all_options !== 'undefined') {
        options = all_options.map((confname) => {
            return (
                <Dropdown.Item eventKey={confname}>{confname}</Dropdown.Item>
            )
        });
    } else {
        options = null;
    }

    return (
        <TitleCard title="LOKI Clock Generator control">
            Clock Generator Device: <StatusBadge label={adapterEndpoint.data.clkgen?.drivername} type={adapterEndpoint.data.clkgen?.drivername === null? "warning" : "success"} />
            <ClkgenEndpointDropdown endpoint={adapterEndpoint} event_type="select" fullpath="clkgen/config_file" buttonText={currently_selected ? currently_selected : "None Selected"} >
                {options}
            </ClkgenEndpointDropdown>
        </TitleCard>
    )
}

let tempreadings = [];
let humreadings = [];
let timestamps = [];
export function LOKIEnvironment({adapterEndpoint, records_to_render}) {
    //const environmentEndpoint = useAdapterEndpoint("detector/environment", api_addr, 5000);

    //const [tempreadings, setTempreadings] = useState([]);

    // This assumes that the names of reading channels will not change
    // Each is a 2d array: {'board': [value0, value1, value2, ...], ...}
    // Each is an array of captures, each of which is an array of channel values in whatever
    // order it appears in the parameter tree.
    //      e.g. [[board temp 0, external temp 0, zynq temp 0],
    //              [board temp 1, external temp 1, zynq temp 1]...]

    function updateReadings(temps, hums, timestamp) {
        //console.log('adding temps ' + temps + ' hums ' + hums + ' at time ' + timestamp);
        let edit_temps = tempreadings;
        let edit_hums = humreadings;
        let edit_timestamps = timestamps;

        // Loop through all of the temperature series
        for (const i of temps.keys()) {
            // If this series index has not been added yet, add it
            if (edit_temps.length <= i) {
                edit_temps[i] = []; // Empty series
            }

            // Add the new entry to the series
            edit_temps[i].push(temps[i])

            // Remove the oldest entry, unless we haven't enough yet
            if (edit_temps[i].length > parseInt(records_to_render)) {
                edit_temps[i].shift();
            }
        }

        // Loop through all of the humidity series
        for (const i of hums.keys()) {
            // If this series index has not been added yet, add it
            if (edit_hums.length <= i) {
                edit_hums[i] = []; // Empty series
            }

            // Add the new entry to the series
            edit_hums[i].push(hums[i])

            // Remove the oldest entry, unless we haven't enough yet
            if (edit_hums[i].length > parseInt(records_to_render)) {
                edit_hums[i].shift();
            }
        }

        // Update the timestamps
        edit_timestamps.push(timestamp);
        if (edit_timestamps.length > parseInt(records_to_render)) {
            edit_timestamps.shift();
        }

        // Update the live record
        tempreadings = edit_temps;
        //setTempreadings(edit_temps);
        humreadings = edit_hums;
        timestamps = edit_timestamps;

        //console.log(tempreadings);
    }

    // Gather current data
    let tempstates = adapterEndpoint.data.environment?.temperature;
    let humstates = adapterEndpoint.data.environment?.humidity;

    // Gather a timestamp, potentially for use later on
    // TODO
    let timestampLatest = null;

    console.log(tempstates);

    // Update storage arrays with new data
    let tempLatestList;
    let tempHeaders = null;
    if (typeof tempstates !== 'undefined') {
        // Get the headers (channels)
        tempHeaders = Object.keys(tempstates);

        // Get the values as a list
        tempLatestList = tempHeaders.map((tempname) => {
            return tempstates[tempname];
        });
    } else {
        tempLatestList = [];
    }

    let humLatestList;
    let humHeaders;
    if (typeof humstates !== 'undefined') {
        // Get the headers (channels)
        humHeaders = Object.keys(humstates);

        // Get the values as a list
        humLatestList = humHeaders.map((humname) => {
            return humstates[humname];
        });
    } else {
        humLatestList = [];
    }

    updateReadings(tempLatestList, humLatestList, timestampLatest);

    console.log('updating temperature graph:');
    console.log(tempreadings);
    console.log(tempHeaders);

    return (
        <LOKIEnvironmentGraph tempereadings={tempreadings} tempHeaders={tempHeaders} humreadings={humreadings} humHeaders={humHeaders} />
    )

}

function LOKIEnvironmentGraph({tempreadings, tempHeaders, humreadings, humHeaders}) {
    if (tempreadings === null || typeof tempreadings === 'undefined') {
        return (<></>)
    }
    return (
        <TitleCard>
            <OdinGraph title="Temperatures" type="line" prop_data={tempreadings} series_names={tempHeaders} />
            <OdinGraph title="Humidities" type="line" prop_data={humreadings} series_names={humHeaders} />
        </TitleCard>
    )
}

export function LOKILEDDisplay({adapterEndpoint}) {
    // Generic display component that will list any LEDs as well as showing their current state.
    // Because it's not present in the device tree currently, any LEDs are assumed to be green.

    let ledstates = adapterEndpoint.data?.user_interaction?.leds;

    let ledrows;
    if (typeof ledstates !== 'undefined') {
        let lednames = Object.keys(ledstates);
        ledrows = lednames.map((ledname) => {
            let ledbool = ledstates[ledname];
            return (
                <StatusBadge label={ledname ? ledname : '???'} type={ledbool ? "primary" : "secondary"} />
            )
        });
    }

    return (<TitleCard title="LEDs">{ledrows}</TitleCard>);
}

export function LOKICarrierInfo({adapterEndpoint, loki_connection_state}) {

    if (!loki_connection_state) {
        return (<></>)
    }

    return (
        <TitleCard title="LOKI Carrier Info">
            <Row>
                <span>LOKI system variant <StatusBadge label={adapterEndpoint.data.carrier_info?.platform} /> version <StatusBadge label={adapterEndpoint.data.carrier_info?.version} /></span>
            </Row>
            <Row>
                <span>Application <StatusBadge label={adapterEndpoint.data.carrier_info?.application_name} /> version <StatusBadge label={adapterEndpoint.data.carrier_info?.application_version} /></span>
            </Row>
            <Row>
                <span>Extensions:  <StatusBadge label={adapterEndpoint.data.carrier_info?.extensions} /></span>
            </Row>
        </TitleCard>
    )
}

export function LOKICarrierTaskStatus({adapterEndpoint, loki_connection_state, setFoundLoopException}) {
    if (!loki_connection_state) {
        return (<></>)
    }

    let loopstatus = adapterEndpoint.data.carrier_info?.loopstatus;
    let loop_exception_found = false;

    let looprows;
    if (typeof loopstatus !== 'undefined') {
        let loopnames = Object.keys(loopstatus);
        looprows = loopnames.map((loopname) => {
            let looprunning = adapterEndpoint.data.carrier_info?.loopstatus[loopname]?.running;
            let loopdone = adapterEndpoint.data.carrier_info?.loopstatus[loopname]?.done;
            let loopexception = adapterEndpoint.data.carrier_info?.loopstatus[loopname]?.exception;

            if (loopexception !== "N/A") {
                loop_exception_found = true;
            };

            return (
                <tr>
                    <th scope="row">{loopname}</th>
                    <td>
                        <StatusBadge label={looprunning ? "Running" : ""} type="success" />
                        <StatusBadge label={loopdone ? "Done" : ""} type="warning" />
                        <StatusBadge label={loopexception === "N/A" ? "" : "ERR: " + loopexception} type="danger" />
                    </td>
                </tr>
            )
        });
    } else {
        looprows = null;
    }

    setFoundLoopException(loop_exception_found);

    return (
        <TitleCard title="LOKI Carrier Task Status">
            <Row>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {looprows}
                    </tbody>
                </table>
            </Row>
        </TitleCard>
    )
}

export function LOKIPerformanceDisplay({adapterEndpoint, show_cpu=true, show_cpu_times=true}) {

    let perfinfo = adapterEndpoint.data.carrier_info?.performance;
    console.log('performance info:', perfinfo);

    return (
        <TitleCard title="LOKI Performance">
            <Row>
                {show_cpu && <Col><LOKICPUInfo cpuInfo={perfinfo?.cpu} show_cpu_times={show_cpu_times}/></Col>}
            </Row>
            <Row>
                {show_cpu && <Col><LOKIMemInfo memInfo={perfinfo?.mem} /></Col>}
            </Row>
        </TitleCard>
    )
}

function LOKICPUInfo({cpuInfo, show_cpu_times=true, show_cpu_times_graph=false}) {

    if (cpuInfo === null || typeof cpuInfo === 'undefined') {
        return (<></>)
    }
    console.log('cpu info: ', cpuInfo);

    let cputimechart = `
    pie showData
        title Times
    ` + Object.keys(cpuInfo.times).map((timename) => {
        if (cpuInfo.times[timename] !== 0) {
            return (`
                "${timename}" : ${cpuInfo.times[timename]}
            `)
        } else {
            return (``)
        }
    }).join('') + `
    `

    return(
        <TitleCard title="LOKI CPU Info">
            <Row>
                <Col>
                    <StatusBox label="CPU Load">{cpuInfo?.load}</StatusBox>
                </Col>
                <Col>
                    <StatusBox label="CPU Perc">{cpuInfo?.percent + "%"}</StatusBox>
                </Col>
            </Row>
            <Row>
                <Col>
                <TitleCard title="CPU Times">
                    <Row>
                        {Object.keys(cpuInfo.times).map((timename) => {
                            return (
                                <Col>
                                    <StatusBox label={timename}>{cpuInfo.times[timename]}</StatusBox>
                                </Col>
                            )
                        })}
                    </Row>
                </TitleCard>
                </Col>
            </Row>
            <Row>
                {show_cpu_times_graph && <Mermaid chart={cputimechart} uid={"lokicputimechart"} />}
            </Row>
        </TitleCard>
    )
}

function LOKIMemInfo({memInfo}) {
    if (memInfo === null || typeof memInfo === 'undefined') {
        return (<></>)
    }
    console.log('mem info: ', memInfo);

    return(
        <TitleCard title="LOKI Memory Info">
            <Row>
                <Col>
                    <StatusBox label="Total">{Math.round(memInfo?.total/1000000) + "MB"}</StatusBox>
                </Col>
                <Col>
                    <StatusBox label="Available">{Math.round(memInfo?.avail/1000000) + "MB"}</StatusBox>
                </Col>
                <Col>
                    <StatusBox label="Cached">{Math.round(memInfo?.cached/1000000) + "MB"}</StatusBox>
                </Col>
                <Col>
                    <StatusBox label="Free">{Math.round(memInfo?.free/1000000) + "MB"}</StatusBox>
                </Col>
            </Row>
        </TitleCard>
    )
}
