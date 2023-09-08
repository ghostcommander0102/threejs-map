import { HtmlProps } from "@react-three/drei/web/Html";
import { useThree } from "@react-three/fiber";
import { useMeshObjectContext } from "contexts/MeshObjectContextProvider";
import { hex_to_color } from "helpers/misc";
import { MapObj } from "mapitApiTypes";
import { MouseEventHandler, SyntheticEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button, Col, Form, FormControl, FormControlProps, Row, Tab, Tabs } from "react-bootstrap"
import { DoubleSide, Euler, MeshBasicMaterial, MeshPhongMaterial, Object3D, Vector3 } from "three";
// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { TextGeometry } from "three-stdlib";



interface IMapboxForm {
    data: any;
    setData: (data: unknown) => void;
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

    const {data, setData, selectedId, centerId} = params;

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
            setData({...data});
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
            setData({ ...data });
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

    const handleChange = (e: any) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        const name = target.name;
        if (name === 'custom_image' && context?.MeshObject && context.MeshObject.length <= 1) {
            formData.custom_image = value;
            setFormData({...formData});
            updateData({...formData});
        }
        context?.MeshObject?.forEach((obj, index) => {
            if (index === 0) return;
            if (!obj.userData.position) {
                obj.userData.position = new Vector3();
                obj.userData.position.copy(obj.position);
            }
            const position = new Vector3();
            position.copy(obj.userData.position);
            switch (name) {
                case 'custom_text':
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
                    formData.custom_image = value;
                    updateData({
                        ...formData,
                    })
                    break;
                case 'size':
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
                    formData.rotate = value;
                    obj.rotation.set(
                        obj.rotation.x,
                        obj.rotation.y,
                        parseFloat(formData.rotate) * Math.PI / 180
                    );
                    break;

                case 'offsetX':
                    position.x += parseFloat(value);
                    obj.position.setX(position.x);
                    formData.offsetX = value;
                    break;

                case 'offsetY':
                    position.y += parseFloat(value);
                    obj.position.setY(position.y);
                    formData.offsetY = value;
                    break;

                case 'text_color':
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
                    formData.bg_color = value;
                    updateData({...formData});
                    break;
            
                default:
                    break;
            }
            startTransition(() => setFormData({ ...formData }));
        })
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


    return (
        <>
            {/* 
            //@ts-ignore */}
            <Button variant="danger" className="mb-3" onClick={handleReset}>Reset</Button>
            <Tabs
                id="main-tab-form"
                activeKey={mainTabKey}
                onSelect={handleChangeTab}
                className="mb-3"
                justify
            >
                <Tab eventKey="retailer" title="Retailer">
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
                        <Tab eventKey="retail_name" title="Retail Name">retail name</Tab>
                        <Tab eventKey="retail_logo" title="Retail Logo">retail logo</Tab>
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
                </Tab>
                <Tab eventKey="special" title="Special">
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
                </Tab>
                <Tab eventKey="custom" title="Custom">
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
                </Tab>
            </Tabs>
            <Form.Group className="mb-3">
                <Row className="align-items-center mb-3">
                    <Col sm="2">
                        <Form.Label className="mb-0">Size</Form.Label>
                    </Col>
                    <Col sm="10">
                        <Form.Control
                            name="size"
                            type="number"
                            value={formData.size}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="2">
                        <Form.Label className="mb-0">Rotate</Form.Label>
                    </Col>
                    <Col sm="10">
                        <Form.Control
                            name="rotate"
                            type="number"
                            value={rotation?? formData.rotate}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="2">
                        <Form.Label className="mb-0">Offset X</Form.Label>
                    </Col>
                    <Col sm="10">
                        <Form.Control
                            name="offsetX"
                            type="number"
                            value={formData.offsetX}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="2">
                        <Form.Label className="mb-0">Offset Y</Form.Label>
                    </Col>
                    <Col sm="10">
                        <Form.Control
                            name="offsetY"
                            type="number"
                            value={formData.offsetY}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col sm="3">
                        <Form.Label className="mb-0">BG Color</Form.Label>
                    </Col>
                    <Col sm="6">
                        <Form.Control
                            name="bg_color"
                            type="string"
                            value={formData.bg_color}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col sm="3">
                        <Form.Control
                            type="color"
                            name="bg_color"
                            value={formData.bg_color}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                {['retail_name', 'custom_text', 'retail_text'].includes(formData.layer_type) && 
                    <Row className="align-items-center mb-3">
                        <Col sm="3">
                            <Form.Label className="mb-0">Text Color</Form.Label>
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
