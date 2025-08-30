import React, { useState, useEffect } from "react";
import { Layout, Card, Modal, Form, Input, DatePicker, Select } from "antd";
import { toast } from "react-toastify";
import { getAllRooms } from "../utils/api";

const { Content } = Layout;
const { RangePicker } = DatePicker;

const Room = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRooms();
        console.log("✅ Kết quả API:", res);
        if (res) {
          setRooms(res);  
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách phòng!");
      }
    };
    fetchRooms();
  }, []);

  const getRoomColor = (status) => {
    switch (status) {
      case "available":
        return "#95de64"; // xanh lá
      case "booked":
        return "#d9d9d9"; // xám
      case "cleaning":
        return "#ff7875"; // đỏ
      default:
        return "#d9d9d9";
    }
  };

  const handleRoomClick = (room) => {
    if (room.status === "available") {
      setSelectedRoom(room);
      setIsModalVisible(true);
    } else {
      toast.error(`Phòng ${room.roomNumber} hiện đang ${room.status}`);
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Thông tin khách hàng:", values);
        Modal.success({
          title: "Đặt phòng thành công",
          content: `Phòng ${selectedRoom.roomNumber} đã được đặt cho khách ${values.tenKhach}`,
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

  // 📌 Render danh sách phòng theo tầng
  const renderFloors = () => {
    // Group rooms theo floor
    const grouped = rooms.reduce((acc, room) => {
      acc[room.floor] = acc[room.floor] || [];
      acc[room.floor].push(room);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => a - b) // sắp xếp theo tầng
      .map((floor) => (
        <div key={floor} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 10 }}>Tầng {floor}</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(6, 1fr)`,
              gap: "16px",
            }}
          >
            {grouped[floor].map((room) => (
              <Card
                key={room._id}
                hoverable
                style={{
                  backgroundColor: getRoomColor(room.status),
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
                onClick={() => handleRoomClick(room)}
              >
                <div style={{ fontSize: 13 }}>P{room.roomNumber}</div>
                <div style={{ fontSize: 11 }}>{room.roomType?.name || "N/A"}</div>
                <div style={{ fontSize: 10 }}>
                  {room.status === "available" ? "Đang chờ" : room.status}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ));
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

        {renderFloors()}

        <Modal
          title={`Đặt phòng ${selectedRoom?.roomNumber}`}
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
