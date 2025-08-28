import React, { useState } from "react";
import { Layout, Card, Modal, Form, Input, DatePicker, Select, Button } from "antd";
import { toast } from "react-toastify";

const { Content } = Layout;
const { RangePicker } = DatePicker;

const Room = () => {
  const floors = 5;
  const roomsPerFloor = 6;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form] = Form.useForm();

  const getRoomColor = (status) => {
    switch (status) {
      case "Bận":
        return "#95de64";
      case "Đang chờ":
        return "#d9d9d9";
      case "Đang dọn":
        return "#ff7875";
      default:
        return "#ff7875";
    }
  };

  const handleRoomClick = (room, status) => {
    if (status === "Đang chờ") {
      setSelectedRoom(room);
      setIsModalVisible(true);
    } else {
      toast.error(`Phòng ${room} hiện đang ${status}`)
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Thông tin khách hàng:", values);
        Modal.success({
          title: "Đặt phòng thành công",
          content: `Phòng ${selectedRoom} đã được đặt cho khách ${values.tenKhach}`,
        });
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const renderFloor = (floor) => {
    const rooms = [];
    for (let room = 1; room <= roomsPerFloor; room++) {
      const status = room % 3 === 0 ? "Bận" : "Đang chờ";
      const type = room % 2 === 0 ? "Phòng đôi" : "Phòng đơn";

      const roomCode = `P${floor}${room.toString().padStart(2, "0")}`;

      rooms.push(
        <Card
          key={`${floor}-${room}`}
          hoverable
          style={{
            backgroundColor: getRoomColor(status),
            textAlign: "center",
            borderRadius: 8,
            color: "#fff",
            fontWeight: "bold",
            height: 80,
            width: 180,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            margin: "0 auto",
          }}
          bodyStyle={{ padding: 6 }}
          onClick={() => handleRoomClick(roomCode, status)}
        >
          <div style={{ fontSize: 13 }}>{roomCode}</div>
          <div style={{ fontSize: 11 }}>{type}</div>
          <div style={{ fontSize: 10 }}>{status}</div>
        </Card>
      );
    }
    return (
      <div
        key={`floor-${floor}`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${roomsPerFloor}, 1fr)`,
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {rooms}
      </div>
    );
  };

  return (
    <Content style={{ margin: "16px" }}>
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          minHeight: 500,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Danh sách phòng</h2>

        {Array.from({ length: floors }, (_, i) => (
          <div key={i}>
            <h3 style={{ marginBottom: 10 }}>Tầng {i + 1}</h3>
            {renderFloor(i + 1)}
          </div>
        ))}

        <Modal
          title={`Đặt phòng ${selectedRoom}`}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="tenKhach"
              label="Tên khách hàng"
              rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="cccd"
              label="CCCD/CMND"
              rules={[{ required: true, message: "Vui lòng nhập số CCCD/CMND" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="ngay"
              label="Ngày check-in / check-out"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <RangePicker format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              name="payment"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
            >
              <Select placeholder="Chọn phương thức">
                <Select.Option value="tienmat">Tiền mặt</Select.Option>
                <Select.Option value="chuyenkhoan">Chuyển khoản</Select.Option>
                <Select.Option value="vnpay">VNPay</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Content>
  );
};

export default Room;
