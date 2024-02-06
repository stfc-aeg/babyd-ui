import './App.css';

import React from 'react';
import {useState} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import {OdinApp, StatusBox, useAdapterEndpoint, TitleCard, DropdownSelector, WithEndpoint, ToggleSwitch, OdinGraph, OdinDoubleSlider} from 'odin-react';
import 'odin-react/dist/index.css'

import {StatusBadge, LOKIConnectionAlert, LOKIClockGenerator, LOKICarrierInfo, LOKIEnvironment, LOKICarrierTaskStatus, LOKIPerformanceDisplay} from './Loki.js'

import {Row, Col, Container, Dropdown, Card, Alert, Button, Spinner, Image} from 'react-bootstrap'
import * as Icon from 'react-bootstrap-icons';

import Mermaid from "./Mermaid";

const ResetMonitorEndpointButton = WithEndpoint(Button);
const SyncEndpointToggleSwitch = WithEndpoint(ToggleSwitch);
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
                <Alert variant={'danger'} show={loki_connection_ok && periodicEndpoint?.data?.application?.system_state?.UNCONTROLLED_RESET}>
                    Unwanted ASIC reset detected! ID was read as default value 0xABCD...
                    <div className="d-flex justify-content-end">
                        <ResetMonitorEndpointButton endpoint={staticEndpoint} event_type="click" delay={100} fullpath="application/system_state/UNCONTROLLED_RESET" value={true} variant={'danger'}>
                            Clear Flag
                        </ResetMonitorEndpointButton>
                    </div>
                </Alert>
                <Row>
                    <LOKIConnectionAlert adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} set_loki_connection_state={set_loki_connection_ok} />
                </Row>
                <Row>
                    <Alert variant='warning' show={foundLoopException}>
                        Possible Loop Error in LOKI control unit! Check loop status.
                    </Alert>
                </Row>
                <Row xs={1} xl={2}>
                    <Col>
                        <Row>
                            <Col>
                                <BabyDSystemStatus adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} asic_enabled={asic_enabled} set_asic_enabled={set_asic_enabled} foundLoopException={foundLoopException} />
                            </Col>
                        </Row>
                        <Row xs={1} md={2}>
                            <Col>
                                <BabyDDataConfig adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} showgraph={true} />
                            </Col>
                            <Col>
                                <Row>
                                    <Col>
                                        <BabyDFrameConfig adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <BabyDSerialiserConfig adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <BabyDLaneConfig adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <BabyDReadoutImage adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled}/>
                        </Row>
                        <Row>
                            <BabyDReadoutRender adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled}/>
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
                            <LOKIPerformanceDisplay adapterEndpoint={periodicEndpoint} />
                        </Row>
                        <Row>
                            <BabyDTimingSettings adapterEndpoint={periodicSlowEndpoint} asic_enabled={asic_enabled} />
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <BabyDBiasControl adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
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
function BabyDSystemStatus({adapterEndpoint, loki_connection_state, asic_enabled, set_asic_enabled, foundLoopException}) {

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
                        <Card className="text-center" style={{width: '18rem'}}>
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
                                        <StatusBadge label={(!foundLoopException && loki_connection_state) ? "" : "Loop Error"} type={!foundLoopException ? "success" : "danger"} />
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
                                        <MainEndpointButton endpoint={adapterEndpoint} event_type="click" delay={100} fullpath="application/system_state/MAIN_EN" value={!(latest_main_enable)} variant={latest_main_enable ? 'danger' : 'primary'}>
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
                                        <Col>
                                            <SyncEndpointToggleSwitch endpoint={adapterEndpoint} event_type="click" label="Manual SYNC" fullpath="application/system_state/SYNC" checked={adapterEndpoint.data.application?.system_state?.SYNC} value={adapterEndpoint.data.application?.system_state?.SYNC} />
                                        </Col>
                                    </Row>
                                </Card.Text>
                                <Card.Footer>
                                    <BabyDDeviceInitBadges adapterEndpoint={adapterEndpoint} hide_init_done={true}/>
                                </Card.Footer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </TitleCard>
    )
}


function BabyDDeviceInitBadges({adapterEndpoint, hide_init_done=true}) {
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
                    {(device_state !== 'initialised' || !hide_init_done) && <StatusBadge label={device_name + " "  + device_state} type={device_state === "initialised" ? "success" : "danger"}/>}
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

const FIFOInputDropdown = WithEndpoint(DropdownSelector);
const AuroraInputDropdown = WithEndpoint(DropdownSelector);
const OutputDropdown = WithEndpoint(DropdownSelector);
const PRBSLenDropdown = WithEndpoint(DropdownSelector);
function BabyDDataConfig({adapterEndpoint, asic_enabled, showgraph=false}) {
    // Show intuitively the configuration of what's being output via the fast data and pixel logic as a flowchart.
    // Also allow configuration of these settings.
    // Also show the full pathway including the carrier board, therefore retimer settings and firefly settings
    
    let fifo_currently_selected = adapterEndpoint.data.application?.pipeline?.fifo_in_mux;
    let aurora_currently_selected = adapterEndpoint.data.application?.pipeline?.aurora_in_mux;
    let output_currently_selected = adapterEndpoint.data.application?.pipeline?.output_mux;
    let prbs_currently_selected = adapterEndpoint.data.application?.pipeline?.prbs_length;

    let merchart = `
        flowchart LR
            pixel[PIXEL]
            subgraph PRBS
                PRBS23[PRBS-23]
                PRBS15[PRBS-15]
            end


            subgraph FIFO
    ` + ((output_currently_selected === 'aurora' && aurora_currently_selected === 'fifo') ? `
                fifo{FIFO}
                style fifo stroke:#333,stroke-width:4px
    ` : `
                fifo{FIFO}
    `) + `
    ` + (fifo_currently_selected === 'prbs15' ? `
                PRBS15 ==> fifo
                pixel -.-> fifo
    ` : `
                PRBS15 -.-> fifo
                pixel ==> fifo
    `) + `
            end


            subgraph PRBS-Select
    ` + ((output_currently_selected === 'prbs') || (output_currently_selected === 'aurora' && aurora_currently_selected === 'prbs') ? `
                prbssel{PRBS<br>SELECT}
                style prbssel stroke:#333,stroke-width:4px
    ` : `
                prbssel{PRBS<br>SELECT}
    `) + `

    ` + (prbs_currently_selected === '15' ? `
                PRBS23 -.-> prbssel
                PRBS15 ==> prbssel
    ` : `
                PRBS23 ==> prbssel
                PRBS15 -.-> prbssel
    `) + `
            end

            subgraph Aurora
    ` + (output_currently_selected === 'aurora' ? `
                aurora{Aurora}
                style aurora stroke:#333,stroke-width:4px
    ` : `
                aurora{Aurora}
    `) + `
    ` + (aurora_currently_selected === 'fifo' ? `
                prbssel -.-> aurora
                fifo ==> aurora
    ` : `
                prbssel ==> aurora
                fifo -.-> aurora
    `) + `
            end
    ` + (
    `       user[User Pattern<br>` + adapterEndpoint.data.application?.pipeline?.user_pattern + `<br>0x` + adapterEndpoint.data.application?.pipeline?.user_pattern.toString(16) +`]`) +
    (output_currently_selected === 'user' ? `
            style user stroke:#333,stroke-width:4px
    ` : `
    `) + `

            subgraph Output
                output[Output]
                style output stroke:#333,stroke-width:4px
    ` + (output_currently_selected === 'user' ? `
                prbssel -...-> output
                user ==> output
                aurora -.-> output
    ` : (output_currently_selected === 'prbs' ? `
                prbssel ====> output
                user -.-> output
                aurora -.-> output
    ` : `
                prbssel -...-> output
                user -.-> output
                aurora ==> output
    `)) + `
            end
    `

    console.log(merchart);

    if (asic_enabled) {
        return (
            <TitleCard title="Fast Data Config">
                <Row>
                    <Mermaid chart={showgraph ? merchart : <></>} uid={"dataflow"} />
                </Row>
                <Row>
                    <Col>
                        {/*<StatusBox label="PRBS">{adapterEndpoint.data.application?.pipeline?.prbs_length}</StatusBox>*/}
                        <PRBSLenDropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/prbs_length" buttonText={prbs_currently_selected ? "PRBS Mode: PRBS-" + prbs_currently_selected: "None selected"} variant='info' >
                            <Dropdown.Item eventKey={15}>PRBS-15</Dropdown.Item>
                            <Dropdown.Item eventKey={23}>PRBS-23</Dropdown.Item>
                        </PRBSLenDropdown>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FIFOInputDropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/fifo_in_mux" buttonText={fifo_currently_selected ? "FIFO In: " + fifo_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="prbs15">prbs15</Dropdown.Item>
                            <Dropdown.Item eventKey="pixel">pixel</Dropdown.Item>
                        </FIFOInputDropdown>
                    </Col>
                    <Col>
                        <AuroraInputDropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/aurora_in_mux" buttonText={aurora_currently_selected ? "Aurora In: " + aurora_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="fifo">fifo</Dropdown.Item>
                            <Dropdown.Item eventKey="prbs">prbs</Dropdown.Item>
                        </AuroraInputDropdown>
                    </Col>
                    <Col>
                        <OutputDropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/output_mux" buttonText={output_currently_selected ? "Output: " + output_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="prbs">prbs</Dropdown.Item>
                            <Dropdown.Item eventKey="aurora">aurora</Dropdown.Item>
                            <Dropdown.Item eventKey="user">user</Dropdown.Item>
                        </OutputDropdown>
                    </Col>
                    <Col>
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
function BabyDFrameConfig({adapterEndpoint, asic_enabled}) {
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
                        Frame Row Range:
                        &nbsp;
                        <StatusBadge label={current_low + ' - ' + current_high} />
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

const SerialiserHalfrateToggleSwitch = WithEndpoint(ToggleSwitch);
function BabyDSerialiserConfig({adapterEndpoint, asic_enabled}) {
    let halfrate_en = adapterEndpoint?.data?.application?.serialiser?.halfrate;

    if (asic_enabled) {
        return (
            <TitleCard title="Serialiser Control">
                <Row>
                    <Col>
                        <SyncEndpointToggleSwitch endpoint={adapterEndpoint} event_type="click" label="Manual SYNC" fullpath="application/system_state/SYNC" checked={adapterEndpoint.data.application?.system_state?.SYNC} value={adapterEndpoint.data.application?.system_state?.SYNC} />
                    </Col>
                    <Col>
                        <SerialiserHalfrateToggleSwitch endpoint={adapterEndpoint} event_type="click" label={"Serialiser Half-rate (7GHz)"} fullpath="application/serialiser/halfrate" checked={halfrate_en} value={halfrate_en} />
                    </Col>
                </Row>
            </TitleCard>
        )
    } else {
        return (<></>);
    }
}

function BabyDTimingSettings({adapterEndpoint, asic_enabled}) {
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

const VDACReadbackButton = WithEndpoint(Button);
const IDACReadbackButton = WithEndpoint(Button);
function BabyDBiasControl({adapterEndpoint, asic_enabled}) {
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
    let bias_names = ['VREFAMP', 'VOUTTH1', 'VOUTTH2', 'IDACCAL', 'IDACCANCEL1', 'IDACCANCEL2', 'VDACREF', 'LDOREF', 'IDACREF', 'COMPAMPBUFFBIAS'];

    let bias_rows;
    if (typeof bias_info !== 'undefined') {
        bias_rows = bias_names.map((bias_name) => {
            let voltage_readback = bias_info[bias_name]?.voltage_readback;
            let current_calc = bias_info[bias_name]?.current_calc;
            let source_select = bias_info[bias_name]?.source_select;
            return (
                <TitleCard title={bias_name}>
                    <Row>
                        {voltage_readback && <StatusBox label="Voltage Readback">{voltage_readback.toFixed(3)}</StatusBox>}
                    </Row>
                    <Row>
                        {current_calc && <StatusBox label="Calc Current (experimental) (mA)">{(current_calc*1000).toFixed(3)}</StatusBox>}
                    </Row>
                    <Row>
                        <Col>
                            {source_select && <StatusBox label="Source Select">{source_select}</StatusBox>}
                        </Col>
                        <Col>
                            {source_select === 'internal' && <StatusBox label="Internal Count">{bias_info[bias_name]?.sources?.internal?.count}</StatusBox>}
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
                        <VDACReadbackButton endpoint={adapterEndpoint} event_type="click" fullpath="application/bias_settings/readback_enable/VDAC" value={!(bias_info?.readback_enable?.VDAC)} variant={bias_info?.readback_enable?.VDAC ? 'danger' : 'primary'}>
                        IDAC Readback EN
                        </VDACReadbackButton>
                    </Col>
                    <Col>
                        <StatusBox label="IDAC Readback">{bias_info?.readback_enable?.IDAC}</StatusBox>
                        <IDACReadbackButton endpoint={adapterEndpoint} event_type="click" fullpath="application/bias_settings/readback_enable/IDAC" value={!(bias_info?.readback_enable?.IDAC)} variant={bias_info?.readback_enable?.IDAC ? 'danger' : 'primary'}>
                        IDAC Readback EN
                        </IDACReadbackButton>
                    </Col>
                    <Col>
                        {bias_rows}
                    </Col>
                </Row>
            </TitleCard>
        )
    }

}

function BabyDReadoutImage({adapterEndpoint, asic_enabled}) {
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

function BabyDReadoutRender({adapterEndpoint, asic_enabled}) {
    let image_dat_fine = adapterEndpoint.data?.application?.readout?.imgdat_fine;
    let image_dat_coarse = adapterEndpoint.data?.application?.readout?.imgdat_coarse;
    let image_dat_combined = adapterEndpoint.data?.application?.readout?.imgdat_combined;

    if (!asic_enabled) {
        return (<></>);
    }

    if ((typeof image_dat_fine !== 'undefined' && image_dat_fine !== null) && (typeof image_dat_coarse !== 'undefined' || image_dat_coarse !== null) && (typeof image_dat_combined !== 'undefined' && image_dat_combined !== null)) {

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

function BabyDLaneConfig({adapterEndpoint, asic_enabled}) {
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
                        <StatusBadge label={retimer_lock === null ? '' : (retimer_lock ? 'Locked' : 'No')} type={retimer_lock ? 'success' : 'danger'}/>
                    </td>
                    <td>
                        <StatusBadge label={retimer_passthrough === null ? '' : (retimer_passthrough ? 'Yes' : 'No')} type={retimer_passthrough ? 'success' : 'danger'}/>
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
