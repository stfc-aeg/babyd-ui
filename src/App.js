import './App.css';

import React from 'react';
import {useState} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import {OdinApp, StatusBox, useAdapterEndpoint, TitleCard, DropdownSelector, WithEndpoint, ToggleSwitch, OdinGraph, OdinDoubleSlider} from 'odin-react';
import 'odin-react/dist/index.css'

import {StatusBadge, LOKIConnectionAlert, LOKIClockGenerator, LOKICarrierInfo, LOKILEDDisplay, LOKIEnvironment, LOKICarrierTaskStatus} from './Loki.js'

import {Row, Col, Container, Dropdown, Card, Alert, Button, Spinner, Image} from 'react-bootstrap'
//import {ArrowRight} from 'react-bootstrap-icons';
import * as Icon from 'react-bootstrap-icons';

function BabyD() {
    const periodicEndpoint = useAdapterEndpoint("detector", "", 1000);
    const staticEndpoint = useAdapterEndpoint("detector");
    const periodicSlowEndpoint = useAdapterEndpoint("detector", "", 5000);
    //const periodicDetectorEndpoint = useAdapterEndpoint("detector", "http://localhost:3000", 200);

    const [loki_connection_ok, set_loki_connection_ok] = useState(true);
    const [asic_enabled, set_asic_enabled] = useState(false);

    const [foundLoopException, setFoundLoopException] = useState(false);

    return (
        <OdinApp title="BabyD UI" navLinks={["BabyD Control", "Debug Info"]}>
            <Container fluid>
                <Row>
                    <LOKIConnectionAlert adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} set_loki_connection_state={set_loki_connection_ok} />
                </Row>
                <Row>
                    <Alert variant='warning' show={foundLoopException}>
                        Possible Loop Error in LOKI control unit! Check loop status.
                    </Alert>
                </Row>
                <Row>
                    <Col>
                        <Row>
                            <BabyD_System_Status adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} asic_enabled={asic_enabled} set_asic_enabled={set_asic_enabled} foundLoopException={foundLoopException} />
                        </Row>
                        <Row>
                            <Col>
                                <BabyD_Data_Config adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                            </Col>
                            <Col>
                                <BabyD_Frame_Config adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                            </Col>
                        </Row>
                        <Row>
                            <BabyD_Lane_Config adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                        </Row>
                        {/*<Row>
                            <LOKILEDDisplay adapterEndpoint={periodicEndpoint} />
                        </Row>*/}
                    </Col>
                    <Col>
                        <Row>
                            <BabyD_Readout_Image adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled}/>
                        </Row>
                        <Row>
                            <BabyD_Readout_Render adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled}/>
                        </Row>
                        <Row>
                            <LOKIEnvironment adapterEndpoint={periodicSlowEndpoint}  records_to_render="20" />
                        </Row>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <LOKIConnectionAlert adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} set_loki_connection_state={set_loki_connection_ok} />
                </Row>
                <Row>
                    <Col>
                        <Row>
                            <LOKIClockGenerator adapterEndpoint={periodicEndpoint} />
                        </Row>
                        <Row>
                            <BabyD_Timing_Settings adapterEndpoint={periodicSlowEndpoint} asic_enabled={asic_enabled} />
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <BabyD_Bias_Control adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                        </Row>
                        <Row>
                            <LOKICarrierInfo adapterEndpoint={staticEndpoint} loki_connection_state={loki_connection_ok}/>
                        </Row>
                        <Row>
                            <LOKICarrierTaskStatus adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} setFoundLoopException={setFoundLoopException} />
                        </Row>
                    </Col>
                </Row>
            </Container>
        </OdinApp>
    )
}

const MainEndpointButton = WithEndpoint(Button);
const InitialisedEndpointButton = WithEndpoint(Button);
function BabyD_System_Status({adapterEndpoint, loki_connection_state, asic_enabled, set_asic_enabled, foundLoopException}) {

    let latest_asic_enabled = adapterEndpoint.data.application?.system_state?.ASIC_EN;
    if (latest_asic_enabled) {
        if (!asic_enabled) {
            // ASIC just enabled
            set_asic_enabled(true);
        }
    } else {
        if (asic_enabled) {
            // ASIC just disabled
            set_asic_enabled(false);
        }
    }

    let latest_main_enable = adapterEndpoint.data.application?.system_state?.MAIN_EN;
    let latest_disconnect_safe = adapterEndpoint.data.application?.system_state?.DISCONNECT_SAFE;

    let latest_bd_init = adapterEndpoint.data.application?.system_state?.BD_INITIALISE?.DONE;
    let latest_bd_init_trig = adapterEndpoint.data.application?.system_state?.BD_INITIALISE?.TRIGGER;

    return (
        <TitleCard title="BabyD System Status">
            <Container>
                <Row class="row align-items-center justify-content-center d-flex">
                    <Col class="col align-self-center">
                        <Card className="text-center" style={{width: '7rem'}}>
                            <Card.Body>
                                <Card.Title>
                                    Control PC
                                </Card.Title>
                                <Card.Text>
                                    <Icon.PcDisplayHorizontal size={30}/>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col class="col align-self-center">
                        <Icon.ArrowRight size={40} color={loki_connection_state ? "green" : "red"}/>
                    </Col>
                    <Col class="col align-self-center">
                        <Card className="text-center" style={{width: '7rem'}}>
                            <Card.Body>
                                <Card.Title>
                                    LOKI
                                </Card.Title>
                                <Card.Text>
                                    <Row>
                                        <Icon.Motherboard  size={30} color={loki_connection_state ? "green" : "red"}/>
                                        <Card>
                                            <Row>
                                                <Col>
                                                    <Icon.Cpu  size={30} />
                                                    <StatusBadge label={Math.round(adapterEndpoint.data?.environment?.temperature?.zynq_ps) + " \u00b0C"} />
                                                </Col>
                                                <Col>
                                                    <Icon.Box  size={30} />
                                                    <StatusBadge label={Math.round(adapterEndpoint.data?.environment?.temperature?.BOARD) + " \u00b0C"} />
                                                </Col>
                                                <Col>
                                                    <Icon.Droplet  size={30} />
                                                    <StatusBadge label={Math.round(adapterEndpoint.data?.environment?.humidity?.BOARD) + "% RH"} />
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Row>
                                    <Row>
                                        <StatusBadge label={loki_connection_state ? "Connected" : "No Con"} type={loki_connection_state ? "success" : "danger"} />
                                    </Row>
                                    <Row>
                                        <StatusBadge label={(!foundLoopException && loki_connection_state) ? "" : "Loop Error"} type={loki_connection_state ? "success" : "danger"} />
                                    </Row>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col class="col align-self-center">
                        <Row>
                            <Icon.ArrowRight size={40} color={latest_main_enable ? "green" : "red"}/>
                        </Row>
                    </Col>
                    <Col class="col align-self-center">
                        <Card className="text-center" border={latest_main_enable ? "success" : "danger"} style={{width: '25rem'}}>
                            <Card.Body>
                                <Card.Header>
                                    <Row>
                                    <Col>
                                        <MainEndpointButton endpoint={adapterEndpoint} event_type="click" fullpath="application/system_state/MAIN_EN" value={!(latest_main_enable)} variant={latest_main_enable ? 'danger' : 'primary'}>
                                            {latest_main_enable && <Icon.Plug size={20} />}
                                            {!latest_main_enable && <Icon.PlugFill size={20} />}
                                            {latest_main_enable ? "Disconnect" : "Connect "}
                                            {(!latest_disconnect_safe && !latest_main_enable) && <Spinner animation="border" size="sm" />}
                                            {(latest_disconnect_safe && !latest_main_enable) && <Spinner animation="grow" size="sm" />}
                                        </MainEndpointButton>
                                    </Col>
                                    <Col>
                                        <InitialisedEndpointButton endpoint={adapterEndpoint} event_type="click" fullpath="application/system_state/BD_INITIALISE/TRIGGER" value={true} disabled={!latest_main_enable} variant='primary'>
                                            {latest_bd_init && <Icon.Repeat size={20} />}
                                            {latest_bd_init ? " Re-Initialise " : "Initialise "}
                                            {(latest_bd_init_trig) && <Spinner animation="border" size="sm" />}
                                            {(!latest_bd_init && latest_main_enable && !latest_bd_init_trig) && <Spinner animation="grow" size="sm" />}
                                        </InitialisedEndpointButton>
                                    </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Title>
                                    BabyD
                                    &nbsp;
                                    <StatusBadge label={latest_bd_init ? "Initialised" : "Not Initialised"} type={latest_bd_init ? "success" : "danger"}/>
                                </Card.Title>
                                <Card.Text>
                                    <Row>
                                        <Col>
                                        <Icon.Motherboard  size={30} color={latest_main_enable ? "green" : "red"}/>
                                        </Col>
                                    </Row>
                                    <Row>
        {/*<StatusBox label="Safe to Remove?" type={adapterEndpoint.data.application?.system_state?.DISCONNECT_SAFE ? "success" : "danger"}>{adapterEndpoint.data.application?.system_state?.DISCONNECT_SAFE ? "Safe" : "NO, disconnect first"}</StatusBox>*/}
                                        <Col>
                                            {latest_main_enable && <Icon.ThermometerHalf  size={30} />}
                                            {latest_main_enable && <StatusBadge label={Math.round(adapterEndpoint.data?.environment?.temperature?.BD_MIC_IN) + " \u00b0C"} />}
                                        </Col>
                                        <Col>
                                            {latest_main_enable && <StatusBadge label={asic_enabled ? "ASIC Enabled" : "ASIC Disabled"} type={asic_enabled ? "success" : "danger"}/>}
                                        </Col>
                                        <Col>
                                            {latest_main_enable && <StatusBadge label={adapterEndpoint.data.application?.system_state?.SYNC ? "ASIC SYNC High" : "ASIC SYNC Low"} type={adapterEndpoint.data.application?.system_state?.SYNC ? "success" : "danger"}/>}
                                        </Col>
                                    </Row>
                                </Card.Text>
                                <Card.Footer>
                                    <BabyD_Device_Init_Badges adapterEndpoint={adapterEndpoint} hide_init_done={true}/>
                                </Card.Footer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </TitleCard>
    )
}


function BabyD_Device_Init_Badges({adapterEndpoint, hide_init_done=true}) {
    let devices = {
        'FireFly' : 'FIREFLY',
        'DAC u1' : 'DAC_U1',
        'DAC u2' : 'DAC_U2',
        'Re-timer' : 'RETIMER',
        'MIC284' : 'MIC284'
    };

    if (typeof timing_registers !== 'undefined') {
        let system_state = adapterEndpoint.data.application?.system_state;
        let device_state_lines;
        device_state_lines = Object.keys(devices).map((device_name) => {
            let device_key = devices[device_name];
            let device_state = system_state[device_key];
            console.log(device_name);
            console.log('device key', device_key);
            return (
                <Col>
                    {(device_state != 'initialised' || !hide_init_done) && <StatusBadge label={device_name + " "  + device_state} type={device_state == "initialised" ? "success" : "danger"}/>}
                </Col>
            )
        });

        return (
            <Row>
                {device_state_lines}
            </Row>
        )
    } else {
        return (<></>)
    }
}

function BabyD_Main_Control({periodicEndpoint}) {
    // This should be the main component used to bring up the system. It should clearly indicate current state,
    // and if possible make obvious what next steps should be. Intuitiveness is key. The user should KNOW when
    // it's safe to power down etc just by glancing at it, and KNOW what to click next.
}

const FIFO_input_Dropdown = WithEndpoint(DropdownSelector);
const Aurora_input_Dropdown = WithEndpoint(DropdownSelector);
const Output_Dropdown = WithEndpoint(DropdownSelector);
const PRBS_len_Dropdown = WithEndpoint(DropdownSelector);
function BabyD_Data_Config({adapterEndpoint, asic_enabled}) {
    // Show intuitively the configuration of what's being output via the fast data and pixel logic as a flowchart.
    // Also allow configuration of these settings.
    // Also show the full pathway including the carrier board, therefore retimer settings and firefly settings
    
    let fifo_currently_selected = adapterEndpoint.data.application?.pipeline?.fifo_in_mux;
    let aurora_currently_selected = adapterEndpoint.data.application?.pipeline?.aurora_in_mux;
    let output_currently_selected = adapterEndpoint.data.application?.pipeline?.output_mux;
    let prbs_currently_selected = adapterEndpoint.data.application?.pipeline?.prbs_length;

    if (asic_enabled) {
        return (
            <TitleCard title="Fast Data Config">
                <Row>
                    <Col>
                        {/*<StatusBox label="FIFO input">{adapterEndpoint.data.application?.pipeline?.fifo_in_mux}</StatusBox>*/}
                        <FIFO_input_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/fifo_in_mux" buttonText={fifo_currently_selected ? "FIFO Input: " + fifo_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="prbs15">prbs15</Dropdown.Item>
                            <Dropdown.Item eventKey="pixel">pixel</Dropdown.Item>
                        </FIFO_input_Dropdown>
                    </Col>
                    <Col>
                        {/*<StatusBox label="Aurora input">{adapterEndpoint.data.application?.pipeline?.aurora_in_mux}</StatusBox>*/}
                        <Aurora_input_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/aurora_in_mux" buttonText={aurora_currently_selected ? "Aurora Input: " + aurora_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="fifo">fifo</Dropdown.Item>
                            <Dropdown.Item eventKey="prbs">prbs</Dropdown.Item>
                        </Aurora_input_Dropdown>
                    </Col>
                    <Col>
                        {/*<StatusBox label="Output">{adapterEndpoint.data.application?.pipeline?.output_mux}</StatusBox>*/}
                        <Output_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/output_mux" buttonText={output_currently_selected ? "Output: " + output_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="prbs">prbs</Dropdown.Item>
                            <Dropdown.Item eventKey="aurora">aurora</Dropdown.Item>
                            <Dropdown.Item eventKey="user">user</Dropdown.Item>
                        </Output_Dropdown>
                    </Col>
                    <Col>
                        {/*<StatusBox label="PRBS">{adapterEndpoint.data.application?.pipeline?.prbs_length}</StatusBox>*/}
                        <PRBS_len_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/prbs_length" buttonText={prbs_currently_selected ? "PRBS-" + prbs_currently_selected: "None selected"} variant='info' >
                            <Dropdown.Item eventKey={15}>PRBS-15</Dropdown.Item>
                            <Dropdown.Item eventKey={23}>PRBS-23</Dropdown.Item>
                        </PRBS_len_Dropdown>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StatusBox label="User Pattern">{adapterEndpoint.data.application?.pipeline?.user_pattern}{adapterEndpoint.data.application?.pipeline?.user_pattern.toString(16)}</StatusBox>
                    </Col>
                </Row>
            </TitleCard>
        )
    } else {
        return (<></>)
    }
}

const EndpointRowSelectSlider = WithEndpoint(OdinDoubleSlider);
function BabyD_Frame_Config({adapterEndpoint, asic_enabled}) {
    // Show intuitively the configuration of what's being output via the fast data and pixel logic as a flowchart.
    // Also allow configuration of these settings.
    // Also show the full pathway including the carrier board, therefore retimer settings and firefly settings

    let current_low = adapterEndpoint.data?.application?.readout?.row_range[0];
    let current_high = adapterEndpoint.data?.application?.readout?.row_range[1];

    if (asic_enabled) {
        return (
            <TitleCard title="Data Frame Config">
                <Row>
                    <Col>
                        Low:
                        <StatusBadge label={current_low} />
                    </Col>
                    <Col>
                        High:
                        <StatusBadge label={current_high} />
                    </Col>
                </Row>
                <Row>
                    <EndpointRowSelectSlider min={0} max={15} steps={1} title="Row Select" showTitle={true} low={current_low} high={current_high} endpoint={adapterEndpoint} event_type="change" delay={0} fullpath="application/readout/row_range" />
                </Row>
            </TitleCard>
        )
    } else {
        return (<></>)
    }
}

function BabyD_SPIReadout() {
    // A basic trigger for SPI readout, with in-browser heatmap rendering.
    // Potentially allow configuration of system for multi-frame etc
}

function BabyD_Timing_Settings({adapterEndpoint, asic_enabled}) {
    // Intuitively display the current timing settings

    if (!asic_enabled) {
        return (<></>);
    }

    let timing_registers = adapterEndpoint.data.application?.timings;
    let timingrows;
    if (typeof timing_registers !== 'undefined') {
        let timing_register_names = Object.keys(timing_registers);
        timingrows = timing_register_names.map((timing_register_name) => {
            let regval = timing_registers[timing_register_name];

            return (
                <tr>
                    <th scope="row">{timing_register_name}</th>
                    <td>
                        <StatusBadge label={regval} type='primary'/>
                    </td>
                </tr>
            )
        });
    } else {
        timingrows = null;
    }

    return (
        <TitleCard title="BabyD Timings">
            <Row>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Register</th>
                            <th scope="col">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timingrows}
                    </tbody>
                </table>
            </Row>
        </TitleCard>
    )
}

function BabyD_Bias_Control({adapterEndpoint, asic_enabled}) {
    // Allow configuration of DACs, ADCs, both internal and external (bias settings).
    // Visually demonstrate where sources of signals are.
    if (!asic_enabled) {
        return (<></>);
    }

    let bias_info = adapterEndpoint.data?.application?.bias_settings;

    // This is hard-coded because it's not expected to change, and is BabyD-specific. In addition,
    // there are keys on the same level as bias names that are not biases, which would make the
    // handlind complicated. However, some generation is still automatic, as the bias sources and
    // available readout depends on the setup.
    let bias_names = ['VOUTTH1', 'VOUTTH2', 'IDACCAL', 'IDACCANCEL1', 'IDACCANCEL2', 'VDACREF', 'LDOREF', 'IDACREF', 'COMPAMPBUFFBIAS'];

    let bias_rows;
    if (typeof bias_info !== 'undefined') {
        bias_rows = bias_names.map((bias_name) => {
            let voltage_readback = bias_info[bias_name]?.voltage_readback;
            let source_select = bias_info[bias_name]?.source_select;
            return (
                <TitleCard title={bias_name}>
                <Row>
                    {voltage_readback && <StatusBox label="Voltage Readback">{voltage_readback.toFixed(3)}</StatusBox>}
                </Row>
                <Row>
                    <Col>
                        {source_select && <StatusBox label="Source Select">{source_select}</StatusBox>}
                    </Col>
                    <Col>
                        {source_select == 'internal' && <StatusBox label="Internal Count">{bias_info[bias_name]?.sources?.internal?.count}</StatusBox>}
                    </Col>
                </Row>
                </TitleCard>
            )
        });
    }

    if (typeof bias_info !== 'undefined') {
        return (
            <TitleCard title="Bias Information">
                <Row>
                    <Col>
                        <StatusBox label="VDAC Readback">{bias_info?.readback_enable?.VDAC}</StatusBox>
                    </Col>
                    <Col>
                        <StatusBox label="IDAC Readback">{bias_info?.readback_enable?.IDAC}</StatusBox>
                    </Col>
                    <Col>
                        {bias_rows}
                    </Col>
                </Row>
            </TitleCard>
        )
    }

}

function BabyD_RegisterAccess() {
    // Simple UI element to read and write ASIC registers. Potentially a table or just
    // simple form? This will not be synchronous in any way, but could be quite useful.
    // This should also somehow make use of the field-based system for browsing register
    // mappings, as these should make things intuitive.
    // Consider efficient access, and whether this will end up spamming requests to the
    // ASIC where bits are volatile.
}

function BabyD_Readout_Image({adapterEndpoint, asic_enabled}) {
    let image_source = adapterEndpoint.data?.application?.readout?.imgout;

    if (!asic_enabled) {
        return (<></>);
    }

    if ((typeof image_source !== 'undefined') && (image_source !== null)) {
        return (
            <TitleCard title='Readout Image'>
                <Row>
                    <Col>
                        <Image src={"http://192.168.0.172:8888/" + image_source} fluid />
                    </Col>
                </Row>
            </TitleCard>
        )
    } else {
        return (<></>)
    }
}

function BabyD_Readout_Render({adapterEndpoint, asic_enabled}) {
    let image_dat_fine = adapterEndpoint.data?.application?.readout?.imgdat_fine;
    let image_dat_coarse = adapterEndpoint.data?.application?.readout?.imgdat_coarse;
    let image_dat_combined = adapterEndpoint.data?.application?.readout?.imgdat_combined;

    if (!asic_enabled) {
        return (<></>);
    }

    if ((typeof image_dat_fine !== 'undefined' && image_dat_fine != null) && (typeof image_dat_coarse !== 'undefined' || image_dat_coarse != null) && (typeof image_dat_combined !== 'undefined' && image_dat_combined != null)) {

        return (
            <TitleCard title='Readout Render'>
                <Row>
                    <Col>
                        <OdinGraph title='Fine' type='heatmap' prop_data={image_dat_fine} colorscale='viridis' />
                    </Col>
                    <Col>
                        <OdinGraph title='Coarse' type='heatmap' prop_data={image_dat_coarse} />
                    </Col>
                    <Col>
                        <OdinGraph title='Combined' type='heatmap' prop_data={image_dat_combined} />
                    </Col>
                </Row>
            </TitleCard>
        )

    } else {
        return (<></>)
    }
}

function BabyD_Lane_Config({adapterEndpoint, asic_enabled}) {
    // This will combine firefly and retimer controls for given lanes.
    if (!asic_enabled) {
        return (<></>);
    }

    // Lanes are taken from firefly because they all exist for firefly. Some do not exist
    // for the retimer (the bypass, for example).
    let ff_laneinfo = adapterEndpoint.data?.application?.firefly?.CHANNELS;
    let retimer_laneinfo = adapterEndpoint.data?.application?.retimer?.CHANNELS;
    let lane_rows;
    if (typeof ff_laneinfo !== 'undefined' ) {
        let lane_names = Object.keys(ff_laneinfo);
        lane_rows = lane_names.map((lane_name) => {
            let ff_en = ff_laneinfo[lane_name].Enabled;
            let retimer_lock = lane_name in retimer_laneinfo ? retimer_laneinfo[lane_name].CDR_Locked : null;
            let retimer_passthrough = lane_name in retimer_laneinfo ? retimer_laneinfo[lane_name].Unlocked_Passthrough : null;
            console.log('ff en', ff_en);
            return (
                <tr>
                    <th scope="row">{lane_name}</th>
                    <td>
                        <StatusBadge label={ff_en ? 'Enabled' : 'Disabled'} type={ff_en ? 'success' : 'danger'}/>
                    </td>
                    <td>
                        <StatusBadge label={retimer_lock == null ? '' : (retimer_lock ? 'Locked' : 'No')} type={retimer_lock ? 'success' : 'danger'}/>
                    </td>
                    <td>
                        <StatusBadge label={retimer_passthrough == null ? '' : (retimer_passthrough ? 'Yes' : 'No')} type={retimer_passthrough ? 'success' : 'danger'}/>
                    </td>
                </tr>
            )
        });
    } else {
        lane_rows = null;
    }

    return (
        <TitleCard title="BabyD Fast Data Output Lanes">
            <Row>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Lane Name</th>
                            <th scope="col">FireFly Output</th>
                            <th scope="col">Retimer Locked</th>
                            <th scope="col">Retimer Passthrough</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lane_rows}
                    </tbody>
                </table>
            </Row>
        </TitleCard>
    )
}

export default BabyD;
