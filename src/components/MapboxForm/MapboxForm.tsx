import { HtmlProps } from "@react-three/drei/web/Html";
import { useThree } from "@react-three/fiber";
import { MeshType, getMaterial } from "Hooks/useMeshFloors/getMaterialAndGeometry";
import { useMeshObjectContext } from "contexts/MeshObjectContextProvider";
import { hex_to_color } from "helpers/misc";
import { MapObj } from "mapitApiTypes";
import { MouseEventHandler, SyntheticEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button, Col, Form, FormControl, FormControlProps, Nav, Row, Tab, Tabs } from "react-bootstrap"
import { DoubleSide, Euler, MeshBasicMaterial, MeshPhongMaterial, Object3D, Vector3 } from "three";
// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { TextGeometry } from "three-stdlib";
import { IConfig, IJsonConfig, IMeshParamsTmp } from "types";



interface IMapboxForm {
    floorIndex: number;
    meshFloors: IMeshParamsTmp;
    config: IConfig;
    data: any;
    setData: (index: number, data: MapObj) => void;
    selectedId: string;
    centerId: string;
}

const mainTabs = ['retailer', 'special', 'custom', ''] as const;
type TMainTabsKey = (typeof mainTabs)[number];
const isTMainTabsKey = (x: any): x is TMainTabsKey => mainTabs.includes(x);

const retailerTabs = ['retail_name', 'retail_text', 'retail_logo', 'custom_text', 'custom_image', ''] as const;
type TRetailerTabsKey = (typeof retailerTabs)[number];
const isTRetailerTabsKey = (x: any): x is TRetailerTabsKey => retailerTabs.includes(x);

const specialTabs = ['kiosk', 'amenity', ''] as const;
type TSpecialTabsKey = (typeof specialTabs)[number];
const isTSpecialTabsKey = (x: any): x is TSpecialTabsKey => specialTabs.includes(x);

const getDefaultMapOjbValues = (centerId: string): MapObj => ({
	id: '',
	center_id: centerId,
	retailer_id: '',
	kiosk_id: null,
	map_obj_name: '',
	obj_type: 'retailer',
	layer_type: 'retail_name',
	value: '',
	custom_text: '',
	custom_image: '',
	hover_text: '',
	bg_color: '',
	transparent: 0,
	text_color: '',
	size: '8',
	rotate: '0',
	offsetX: '0',
	offsetY: '0',
});

const MapboxForm = (params: IMapboxForm) => {

    const {data, setData, selectedId, centerId, config, floorIndex, meshFloors} = params;

    const [mainTabKey, setMainTabKey] = useState<TMainTabsKey>('');
    const [retailerTabsKey, setRetailerTabsKey] = useState<TRetailerTabsKey>('');
    const [specialTabsKey, setSpecialTabsKey] = useState<TSpecialTabsKey>('');
    const [formData, setFormData] = useState<MapObj>(getDefaultMapOjbValues(centerId));
    const [rotation, setRotation] = useState<number | undefined>(undefined);
    const context = useMeshObjectContext();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleChangeTab = (k:  any | null) => {
        const key: TMainTabsKey | TRetailerTabsKey | TSpecialTabsKey | null = k;
        if (key !== null) {
            if (isTMainTabsKey(key)) {
                setMainTabKey(key);
                if (formData.id && formData.obj_type !== key && mainTabKey && key && mainTabKey !== key) {
                    formData.obj_type = key;
                    if (key === 'retailer') {
                        formData.layer_type = 'retail_name';
                    } else if (key === 'special') {
                        formData.layer_type = 'kiosk';
                        formData.retailer_id = '';
                    } else if (key === 'custom') {
                        formData.layer_type = 'custom_text';
                        formData.retailer_id = '';
                    }
                    setMainTabKey('');
                    setRetailerTabsKey('');
                    setSpecialTabsKey('');
                    setFormData({...formData});
                    updateData({
                        ...formData,
                    });
                }
            } else if (isTRetailerTabsKey(key)) {
                setRetailerTabsKey(key);
                if (formData.id && formData.layer_type !== key && retailerTabsKey && key && retailerTabsKey !== key) {
                    formData.layer_type = key;
                    setRetailerTabsKey('');
                    setFormData({...formData});
                    updateData({
                        ...formData,
                    })
                }
            } else if (isTSpecialTabsKey(key)) {
                setSpecialTabsKey(key);
                if (formData.id && formData.layer_type !== key && specialTabsKey && key && specialTabsKey !== key) {
                    formData.layer_type = key;
                    formData.kiosk_id = '';
                    formData.retailer_id = '';
                    formData.value = '';
                    setFormData({ ...formData });
                    updateData({ ...formData });
                }
            }
        }
    }

    const handleRotateChange = (e: any) => {
        formData.rotate = e.target.value;
        setFormData({...formData});
        const index = data.map_objs.findIndex((value: MapObj) => value.id === formData.id);
        if (index !== -1) {
            data.map_objs[index] = {...formData};
            setData(index, {...data});
        }
    }

    const handleReset = () => {
        const defaultValues = getDefaultMapOjbValues(formData.center_id);
        setFormData({
            ...defaultValues,
            id: formData.id,
        });
        updateData({
            ...defaultValues,
            id: formData.id,
        });
    }

    const updateData = (formData: MapObj) => {
        // setFormData({...formData});
        const index = data.map_objs.findIndex((value: MapObj) => value.id === formData.id);
        if (index !== -1) {
            data.map_objs[index] = { ...formData };
            setData(index, { ...data });
            // if (timeoutRef.current) {
            //     clearTimeout(timeoutRef.current);
            // }

            // timeoutRef.current = setTimeout(() => {
            // }, 300);
        }
    }

    const handleChangeRetailer = (e: any) => {
        if (e.target.value) {
            formData.retailer_id = e.target.value;
            formData.kiosk_id = '';
            setFormData({...formData});
            updateData({...formData});
        }
    }

    const handleChangeKiosk = (e: any) => {
        if (e.target.value) {
            formData.kiosk_id = e.target.value;
            formData.retailer_id = '';
            setFormData({...formData});
            updateData({...formData});
        }
    }

    const handleChangeAmenity = (e: any) => {
        if (e.target.value) {
            formData.value = e.target.value; 
            setFormData({...formData});
            updateData({...formData});
        }
    }

    const changeValue = (name: string, value: string) => {
        if (name === 'custom_image' && context?.MeshObject && context.MeshObject.length <= 1) {
            formData.custom_image = value;
            setFormData({...formData});
            updateData({...formData});
        }
        context?.MeshObject?.forEach((obj, index) => {
            if (!obj.userData.position) {
                obj.userData.position = new Vector3();
                obj.userData.position.copy(obj.position);
            }
            const position = new Vector3();
            position.copy(obj.userData.position);
            switch (name) {
                case 'custom_text':
                    if (index === 0) break;
                    formData.custom_text = value;
                    if (['retail_text', 'custom_text'].includes(formData.layer_type)) {
                        let text_geometry = new TextGeometry(formData.custom_text, {
                            font: obj.userData.font,
                            size: parseInt(formData.size),
                            height: 0.01,
                            curveSegments: 4,
                        });
                        text_geometry.center();
                        obj.geometry.dispose();
                        obj.geometry = text_geometry;
                    }
                    break;
                case 'custom_image':
                    if (index === 0) break;
                    formData.custom_image = value;
                    updateData({
                        ...formData,
                    })
                    break;
                case 'size':
                    if (index === 0) break;
                    formData.size = value;
                    if (!(['retail_logo', 'kiosk', 'amenity', 'custom_image'].includes(formData.layer_type))) {
                        let text = '';
                        if (formData.layer_type === 'retail_name' && obj.userData.retail_name) {
                            text = obj.userData.retail_name;
                        } else if (['retail_text', 'custom_text'].includes(formData.layer_type)) {
                            text = formData.custom_text;
                        }
                        let text_geometry = new TextGeometry(text, {
                            font: obj.userData.font,
                            size: parseInt(formData.size),
                            height: 0.01,
                            curveSegments: 4,
                        });
                        text_geometry.center();
                        obj.geometry.dispose();
                        obj.geometry = text_geometry;
                    } else if (formData.layer_type === 'retail_logo' || formData.layer_type === 'custom_image') {
                        if (timeoutRef.current) {
                            clearInterval(timeoutRef.current);
                        }
                        timeoutRef.current = setTimeout(() => {
                            updateData({ ...formData });
                        }, 300);
                    } else if (['amenity', 'kiosk'].includes(formData.layer_type)) {
                        startTransition(() => {
                            setFormData({ ...formData });
                            updateData({ ...formData });
                        })
                    } 
                    break;

                case 'rotate':
                    if (index === 0) break;
                    formData.rotate = value;
                    obj.rotation.set(
                        obj.rotation.x,
                        obj.rotation.y,
                        parseFloat(formData.rotate) * Math.PI / 180
                    );
                    break;

                case 'offsetX':
                    if (index === 0) break;
                    position.x += parseFloat(value);
                    obj.position.setX(position.x);
                    formData.offsetX = value;
                    break;

                case 'offsetY':
                    if (index === 0) break;
                    position.y += parseFloat(value);
                    obj.position.setY(position.y);
                    formData.offsetY = value;
                    break;

                case 'text_color':
                    if (index === 0) break;
                    formData.text_color = value;
                    if (['retail_name', 'retail_text', 'custom_text'].includes(formData.layer_type)) {
                        const material_settings = {
                            // color: hex_to_color(formData.text_color),
                            color: formData.text_color,
                            transparent: true,
                            side: DoubleSide,
                            depthWrite: false,
                            depthTest: false,
                        };
                        let text_material = new MeshPhongMaterial(material_settings);
                        obj.material = text_material;
                    } else if (
                        formData.layer_type === 'retail_logo' ||
                        formData.layer_type === 'custom_image' ||
                        (formData.obj_type === 'special' && formData.layer_type === 'kiosk' && formData.kiosk_id != null) ||
                        (formData.obj_type === 'special' && formData.layer_type === 'amenity' && formData.value !== '')) {
                        startTransition(() => {
                            updateData({
                                ...formData,
                                text_color: formData.text_color.replace('#', ''),
                            });
                        })
                    }
                    break;

                case 'bg_color':
                    if (index !== 0) break;
                    formData.bg_color = value;
                    let meshType: MeshType = 'store';
                    if (obj.object_id?.startsWith('big-store')) {
                        meshType = 'big-store';
                    }
                    obj.material = getMaterial(
                        config,
                        meshType,
                        formData.map_obj_name,
                        formData.bg_color,
                        formData.transparent === "1"? true : false,
                        {[formData.map_obj_name]: {...formData}}
                        );
                    // updateData({...formData});
                    break;
            
                default:
                    break;
            }
            startTransition(() => {
                setFormData({ ...formData })
                setData(0, { ...data });
            });
        })
    }
    const handleChange = (e: any) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        const name = target.name;
        changeValue(name, value);
    }

    useEffect(() => {
        if (data && data.map_objs && selectedId) {
            const index = data.map_objs.findIndex((value: any) => value.map_obj_name === selectedId);
            if (index !== -1) {
                setFormData({...data.map_objs[index]});
            }
        }
        return () => {
            setRetailerTabsKey('');
        }
    }, [data, selectedId])

    useEffect(() => {
        if (formData.obj_type) {
            handleChangeTab(formData.obj_type);
        }
        if (formData.layer_type) {
            handleChangeTab(formData.layer_type);
        }
    }, [formData])

    const handleDecrement = (key: 'size' | 'rotate' | 'offsetX' | 'offsetY') => () => {
        if (Object.hasOwn(formData, key)) {
            let value = parseInt(formData[key]);
            value -= 1;
            changeValue(key, value.toString());
        }
    }

    const handleIncrement = (key: 'size' | 'rotate' | 'offsetX' | 'offsetY') => () => {
        if (Object.hasOwn(formData, key)) {
            let value = parseInt(formData[key]);
            value += 1;
            changeValue(key, value.toString());
        }
    }


    return (
        <>
            <Tab.Container activeKey={mainTabKey}>
                <Col>
                    <Row>
                        <Col sm="9">
                            <Nav
                                variant="tabs"
                                className="flex-row"
                                // activeKey={mainTabKey}
                                onSelect={handleChangeTab}
                            >
                                <Nav.Item>
                                    <Nav.Link eventKey={"retailer"}>Retailer</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={"special"}>Special</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={"custom"}>Custom</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm="3">
                            {/* 
                //@ts-ignore */}
                            <Button variant="danger" className="mb-3" onClick={handleReset}>Reset</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <Tab.Content>
                                <Tab.Pane eventKey={"retailer"}>
                    <Form.Select className="mb-3" aria-label="Choose a Retailer" value={formData.retailer_id?? ''} onChange={handleChangeRetailer}>
                        <option value={''} disabled hidden>Choose a Retalier...</option>
                        {data.retailers?.map((value: any) => <option key={`retailer-${value.id}`} value={value.id}>{value.retail_name} - {value.location}</option>)}
                    </Form.Select>
                    <Tabs
                        variant="pills"
                        id="retail-tab-form"
                        activeKey={retailerTabsKey}
                        onSelect={handleChangeTab}
                    >
                        <Tab eventKey="retail_name" title="Retail Name"></Tab>
                        <Tab eventKey="retail_logo" title="Retail Logo"></Tab>
                        <Tab eventKey="retail_text" title="Custom Text">
                            <Form.Group className="m-3">
                                <Row className="align-items-center mb-3">
                                    <Col sm="2">
                                        <Form.Label className="mb-0">Text</Form.Label>
                                    </Col>
                                    <Col sm="10">
                                        <Form.Control
                                            as="textarea"
                                            name="custom_text"
                                            rows={3}
                                            value={formData.custom_text}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Tab>

                    </Tabs>
                                </Tab.Pane>
                                <Tab.Pane eventKey={"special"}>
                    <Tabs
                        variant="pills"
                        id="special-tab-form"
                        activeKey={specialTabsKey}
                        onSelect={handleChangeTab}
                     >
                        <Tab eventKey="kiosk" title="Kiosk">
                            <Form.Select className="m-3" aria-label="Choose a Retailer" value={formData.kiosk_id?? ''} onChange={handleChangeKiosk}>
                                <option value={''} disabled hidden>Choose a Kiosk...</option>
                                {data.kiosks?.map((value: any) => <option key={`kiosk-${value.id}`} value={value.id}>{value.title}</option>)}
                            </Form.Select>
                        </Tab>
                        <Tab eventKey="amenity" title="Amenity">
                            <Form.Select className="m-3" aria-label="Choose a Retailer" value={formData.value} onChange={handleChangeAmenity}>
                                <option value={''} disabled hidden>Choose Amenity...</option>
                                {Object.keys(data.amenities)?.map((value: string) => (
                                    <option key={`amenity-${value}`} value={value}>{data.amenities[value].name}</option>
                                ))}
                            </Form.Select>
                        </Tab>
                    </Tabs>
                                </Tab.Pane>
                                <Tab.Pane eventKey={"custom"}>
                    <Tabs
                        variant="pills"
                        id="custom-tab-form"
                        activeKey={retailerTabsKey}
                        onSelect={handleChangeTab}
                     >
                        <Tab eventKey="custom_text" title="Text">
                            <Form.Group className="m-3">
                                <Row className="align-items-center mb-3">
                                    <Col sm="2">
                                        <Form.Label className="mb-0">text</Form.Label>
                                    </Col>
                                    <Col sm="10">
                                        <Form.Control
                                            name="custom_text"
                                            as="textarea"
                                            rows={3}
                                            value={formData.custom_text}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Tab>
                        <Tab eventKey="custom_image" title="Image">
                            <Form.Group className="m-3">
                                <Row className="align-items-center mb-3">
                                    <Col sm="2">
                                        <Form.Label className="mb-0">Image URL</Form.Label>
                                    </Col>
                                    <Col sm="10">
                                        <Form.Control
                                            type="string"
                                            name="custom_image"
                                            value={formData.custom_image}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Tab>
                    </Tabs>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Col>
            </Tab.Container>
            <Form.Group className="mb-3 mt-3">
                <Row className="align-items-center mb-3">
                    <Col sm="4" className="d-flex justify-content-start">
                        <Form.Label className="mb-0">Size</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Row>
                            <Col sm="2" className="d-flex">
                                <Button onClick={handleDecrement('size')} variant="outline-dark">-</Button>
                            </Col>
                            <Col sm="4">
                                <Form.Control
                                    name="size"
                                    type="number"
                                    value={formData.size}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col sm="2" className="d-flex justify-content-end">
                                <Button onClick={handleIncrement('size')} variant="outline-dark">+</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="4" className="d-flex justify-content-start">
                        <Form.Label className="mb-0">Rotate</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Row>
                            <Col sm="2" className="d-flex">
                                <Button onClick={handleDecrement('rotate')} variant="outline-dark">-</Button>
                            </Col>
                            <Col sm="4">
                                <Form.Control
                                    name="rotate"
                                    type="number"
                                    value={rotation ?? formData.rotate}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col sm="2" className="d-flex justify-content-end">
                                <Button onClick={handleIncrement('rotate')} variant="outline-dark">+</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="4" className="d-flex justify-content-start">
                        <Form.Label className="mb-0">Offset X</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Row>
                            <Col sm="2" className="d-flex">
                                <Button onClick={handleDecrement('offsetX')} variant="outline-dark">-</Button>
                            </Col>
                            <Col sm="4">

                                <Form.Control
                                    name="offsetX"
                                    type="number"
                                    value={formData.offsetX}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col sm="2" className="d-flex justify-content-end">
                                <Button onClick={handleIncrement('offsetX')} variant="outline-dark">+</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="4" className="d-flex justify-content-start">
                        <Form.Label className="mb-0">Offset Y</Form.Label>
                    </Col>
                    <Col sm="8">
                        <Row>
                            <Col sm="2" className="d-flex">
                                <Button onClick={handleDecrement('offsetY')} variant="outline-dark">-</Button>
                            </Col>
                            <Col sm="4">
                                <Form.Control
                                    name="offsetY"
                                    type="number"
                                    value={formData.offsetY}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col sm="2" className="d-flex justify-content-end">
                                <Button onClick={handleIncrement('offsetY')} variant="outline-dark">+</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="3" className="d-flex justify-content-start">
                        <Form.Label className="mb-0">BG Color</Form.Label>
                    </Col>
                    <Col sm="3" className="p-0">
                        <Form.Control
                            name="bg_color"
                            type="string"
                            value={formData.bg_color}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col sm="2">
                        <Form.Control
                            type="color"
                            name="bg_color"
                            value={formData.bg_color}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col sm="4">
                        <Row>
                            <Col sm="3">
                                <input
                                        name="transparent"
                                        id="transparent"
                                        type="checkbox"
                                        value={formData.transparent}
                                        onChange={handleChange}
                                ></input>
                                    {/* <Form.Control
                                        name="transparent"
                                        type="checkbox"
                                        value={formData.transparent}
                                        onChange={handleChange}
                                    ></Form.Control> */}
                            </Col>
                            <Col sm="9" className="p-0">
                                <Form.Label for="transparent" className="mb-0">Transparent</Form.Label>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {['retail_name', 'custom_text', 'retail_text'].includes(formData.layer_type) && 
                    <Row className="align-items-center mb-3">
                        <Col sm="4" className="d-flex justify-content-start">
                            <Form.Label className="mb-0">Text Color</Form.Label>
                        </Col>
                        <Col sm="5">
                            <Form.Control
                                type="string"
                                name="text_color"
                                value={formData.text_color}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col sm="3">
                            <Form.Control
                                name="text_color"
                                type="color"
                                value={formData.text_color}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                }
                {['kiosk', 'amenity'].includes(formData.layer_type) && 
                    <Row className="align-items-center mb-3">
                        <Col sm="3">
                            <Form.Label className="mb-0">Icon Color</Form.Label>
                        </Col>
                        <Col sm="6">
                            <Form.Control
                                type="string"
                                name="text_color"
                                value={formData.text_color}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col sm="3">
                            <Form.Control
                                type="color"
                                name="text_color"
                                value={formData.text_color}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                }
            </Form.Group>
        </>
    );
}

export default MapboxForm;
