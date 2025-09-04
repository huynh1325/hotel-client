import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Radio,
  InputNumber,
  Button,
} from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getAllRooms } from "../utils/api"; // chỗ này đổi thành API call thật của bạn

const { Content } = Layout;

const Room = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Map rentType từ API
  const mapRentType = (apiType) => {
    switch (apiType) {
      case "ngay":
        return "day";
      case "dem":
        return "night";
      case "gio":
        return "hour";
      default:
        return apiType;
    }
  };

  // load danh sách phòng
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRooms();
        setRooms(res);
      } catch (err) {
        toast.error("Không tải được danh sách phòng");
      }
    };
    fetchRooms();
  }, []);

  // mặc định chọn day/night
  const getDefaultStayType = () => {
    const currentHour = dayjs().hour();
    return currentHour < 19 ? "day" : "night";
  };

  const getRoomColor = (status) => {
    switch (status) {
      case "occupied":
        return "#ff7875"; // đỏ nhạt
      case "booked":
        return "#95de64"; // xanh nhạt
      case "available":
      default:
        return "#d9d9d9"; // xám nhạt
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
    form.resetFields();
    setCalculatedPrice(0);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRoom(null);
  };

  const updatePrice = (type, value, usageType) => {
    if (!selectedRoom || !selectedRoom.roomType) return;

    const prices = selectedRoom.roomType.prices || [];
    const apiType = type === "day" ? "ngay" : type === "night" ? "dem" : "gio";

    let priceObj = prices.find((p) => p.rentType === apiType);
    let unitPrice = priceObj ? priceObj.price : 0;

    // nếu phòng có quạt + điều hòa thì tính theo loại khách chọn
    if (selectedRoom.roomType.name === "Đơn (quạt + điều hòa)") {
      if (usageType === "quat") {
        unitPrice = Math.floor(unitPrice * 0.7); // ví dụ giảm còn 70% giá điều hòa
      }
    }

    let total = 0;
    if (type === "day" || type === "night") total = unitPrice * value;
    else if (type === "hour") total = unitPrice * value;

    // + phí trễ nếu có
    total += selectedRoom.roomType.lateFee || 0;

    setCalculatedPrice(total);
  };

  const handleFinish = (values) => {
    console.log("Booking info:", values);
    toast.success("Đặt phòng thành công!");
    setIsModalVisible(false);
  };

  return (
    <Layout style={{ padding: "20px" }}>
      <Content>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {rooms.map((room) => (
            <Card
              key={room._id}
              style={{
                backgroundColor: getRoomColor(room.status),
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => handleRoomClick(room)}
            >
              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                {room.roomNumber}
              </div>
              <div style={{ fontSize: 14 }}>
                {room.roomType?.name || "N/A"}
              </div>
            </Card>
          ))}
        </div>

        <Modal
          title={`Đặt phòng ${selectedRoom?.roomNumber || ""}`}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
              name="customerName"
              label="Tên khách hàng"
              rules={[{ required: true, message: "Nhập tên khách hàng" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="stayType"
              label="Loại thuê"
              initialValue={getDefaultStayType()}
            >
              <Select>
                <Select.Option value="day">Theo ngày</Select.Option>
                <Select.Option value="night">Qua đêm</Select.Option>
                <Select.Option value="hour">Theo giờ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: "Nhập số lượng" }]}
            >
              <InputNumber min={1} onChange={(val) => {
                const stayType = form.getFieldValue("stayType");
                const usageType = form.getFieldValue("usageType");
                updatePrice(stayType, val, usageType);
              }} />
            </Form.Item>

            {selectedRoom?.roomType?.name === "Đơn (quạt + điều hòa)" && (
              <Form.Item
                name="usageType"
                label="Chọn hình thức sử dụng"
                rules={[{ required: true, message: "Chọn quạt hoặc điều hòa" }]}
              >
                <Radio.Group
                  onChange={(e) => {
                    const stayType = form.getFieldValue("stayType");
                    const qty = form.getFieldValue("quantity") || 1;
                    updatePrice(stayType, qty, e.target.value);
                  }}
                >
                  <Radio value="quat">Quạt</Radio>
                  <Radio value="dieuhoa">Điều hòa</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            <div style={{ marginBottom: 15 }}>
              <strong>Thành tiền: </strong>
              {calculatedPrice.toLocaleString("vi-VN")} VND
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Xác nhận đặt
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Room;
