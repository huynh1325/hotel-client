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
} from "antd";
import { toast } from "react-toastify";
import { getAllRooms, createBooking, getCurrentBookingByRoom, checkoutRoomApi } from "../utils/api";
import dayjs from "dayjs";

const { Content } = Layout;
const { RangePicker } = DatePicker;

const Room = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState([]);
  const [stayType, setStayType] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [checkoutRoom, setCheckoutRoom] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [defaultCheckoutTime, setDefaultCheckoutTime] = useState(null);
  const [prevStayTime, setPrevStayTime] = useState([null, null]);
  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRooms();
        if (res) setRooms(res);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách phòng!");
      }
    };
    fetchRooms();
  }, []);

  const getRoomColor = (status) => {
    switch (status) {
      case "available":
        return "#d5d5d5ff";
        // return "#95de64";
      case "booked":
        // return "#d9d9d9";
        return "#95de64";
      case "cleaning":
        return "#ff7875";
      default:
        return "#d9d9d9";
    }
  };

  const updatePriceForRoom = (room, type, value, roomTypeIndex = 0) => {
    if (!room?.roomType?.length) return;

    const roomType = room.roomType[roomTypeIndex];
    const prices = roomType.basePricing || [];

    const getPrice = (bookingType) => {
      const p = prices.find((pr) => pr.bookingType === bookingType);
      return p ? p.price : 0;
    };

    let total = 0;

    switch (type) {
      case "daily":
        total = getPrice("daily") * value;
        break;

      case "hourly":
        total = getPrice("hourly") * value;
        break;

      case "overnight":
        if (value <= 1) {
          total = getPrice("overnight");
        } else {
          total = getPrice("overnight") + getPrice("daily") * (value - 1);
        }
        break;

      default:
        total = 0;
    }

    setCalculatedPrice(total);
  };

  const handleRoomClick = async (room) => {
    if (room.status === "available") {
      setSelectedRoom(room);
      setSelectedRoomType(0);
      setStayType("daily"); // mặc định

      const now = dayjs();
      // giữ mặc định checkout giống trước: +1 ngày lúc 12:00
      const defaultCheckout = now.add(1, "day").hour(12).minute(0).second(0);

      form.setFieldsValue({
        stayType: "daily",
        stayTime: [now, defaultCheckout],
        numOfDays: 1,
        duration: null,
      });

      // lưu mặc định để khi user thay check-in ta vẫn giữ giờ check-out (12:00)
      setDefaultCheckoutTime(defaultCheckout);
      setPrevStayTime([now, defaultCheckout]);

      updatePriceForRoom(room, "daily", 1, selectedRoomType ?? 0);
      setIsModalVisible(true);
    } else if (room.status === "booked") {
      try {
        const booking = await getCurrentBookingByRoom(room._id);
        if (booking.data) {
          setCurrentBooking(booking.data);
          setCheckoutRoom(room);
          setIsCheckoutModalVisible(true);
        } else {
          toast.error("Không tìm thấy booking nào cho phòng này!");
        }
      } catch (err) {
        toast.error("Lỗi khi lấy thông tin booking!");
      }
    } else {
      toast.error(`Phòng ${room.roomNumber} hiện đang ${room.status}`);
    }
  };

  const handleStayTypeChange = (e) => {
    const type = e.target.value;
    setStayType(type);

    const now = dayjs();
    if (type === "daily" || type === "overnight") {
      const defaultCheckout = now.add(1, "day").hour(12).minute(0).second(0);
      form.setFieldsValue({
        stayTime: [now, defaultCheckout],
        numOfDays: 1,
        duration: null,
      });
      setDefaultCheckoutTime(defaultCheckout);
      setPrevStayTime([now, defaultCheckout]);
      updatePriceForRoom(selectedRoom, type, 1, selectedRoomType ?? 0);
    } else {
      const defaultCheckout = now.add(1, "hour");
      form.setFieldsValue({
        stayTime: [now, defaultCheckout],
        duration: 1,
        numOfDays: null,
      });
      setDefaultCheckoutTime(defaultCheckout);
      setPrevStayTime([now, defaultCheckout]);
      updatePriceForRoom(selectedRoom, "hourly", 1, selectedRoomType ?? 0);
    }
  };

  const handleStayTimeChange = (values) => {
  if (!values || !values[0]) {
    form.setFieldsValue({ stayTime: values });
    setPrevStayTime(values || [null, null]);
    return;
  }

  const [newStart, newEnd] = values;
  const [prevStart, prevEnd] = prevStayTime;

  const startChanged = !prevStart || !newStart.isSame(prevStart);
  const endChanged = newEnd && prevEnd && !newEnd.isSame(prevEnd);

  if (startChanged && !endChanged) {
    if (defaultCheckoutTime) {
      const dayDiff = prevStart && prevEnd ? prevEnd.startOf('day').diff(prevStart.startOf('day'), 'day') : 1;
      let candidate = newStart.clone().add(dayDiff, 'day')
        .hour(defaultCheckoutTime.hour())
        .minute(defaultCheckoutTime.minute())
        .second(defaultCheckoutTime.second());

      if (!candidate.isAfter(newStart)) {
        candidate = candidate.add(1, 'day');
      }

      form.setFieldsValue({ stayTime: [newStart, candidate] });
      setPrevStayTime([newStart, candidate]);

      if (stayType === "hourly") {
        const hours = candidate.diff(newStart, "hour");
        form.setFieldsValue({ duration: hours || 1 });
        updatePriceForRoom(selectedRoom, "hourly", hours || 1, selectedRoomType ?? 0);
      } else {
        const days = Math.max(1, candidate.startOf("day").diff(newStart.startOf("day"), "day"));
        form.setFieldsValue({ numOfDays: days });
        updatePriceForRoom(selectedRoom, stayType || "daily", days, selectedRoomType ?? 0);
      }
    } else {
      const fallbackEnd = newEnd || newStart.clone().add(1, 'day');
      form.setFieldsValue({ stayTime: [newStart, fallbackEnd] });
      setPrevStayTime([newStart, fallbackEnd]);
    }
  } else if (endChanged) {
    form.setFieldsValue({ stayTime: [newStart, newEnd] });
    setDefaultCheckoutTime(newEnd);
    setPrevStayTime([newStart, newEnd]);

    if (stayType === "hourly") {
      const hours = newEnd.diff(newStart, "hour");
      form.setFieldsValue({ duration: hours || 1 });
      updatePriceForRoom(selectedRoom, "hourly", hours || 1, selectedRoomType ?? 0);
    } else {
      const days = Math.max(1, newEnd.startOf("day").diff(newStart.startOf("day"), "day"));
      form.setFieldsValue({ numOfDays: days });
      updatePriceForRoom(selectedRoom, stayType || "daily", days, selectedRoomType ?? 0);
    }
  } else {
    form.setFieldsValue({ stayTime: [newStart, newEnd] });
    setPrevStayTime([newStart, newEnd]);
  }
};

  const handleNumOfDaysChange = (value) => {
    const type = stayType;
    const today = dayjs();
    let checkin, checkout;

    if (type === "daily") {
      checkin = today.hour(14).minute(0).second(0);
      checkout = checkin.add(value, "day").hour(12).minute(0).second(0);
    } else if (type === "overnight") {
      checkin = today.hour(19).minute(0).second(0);
      checkout = checkin.add(value, "day").hour(12).minute(0).second(0);
    }

    form.setFieldsValue({ stayTime: [checkin, checkout] });
    updatePriceForRoom(selectedRoom, type, value, selectedRoomType ?? 0);
  };

  const handleDurationChange = (value) => {
    const stayTime = form.getFieldValue("stayTime");
    const checkin = stayTime?.[0] || dayjs();
    if (value) {
      const checkout = checkin.add(value, "hour");
      form.setFieldsValue({ stayTime: [checkin, checkout] });
      updatePriceForRoom(selectedRoom, "hourly", value, selectedRoomType ?? 0);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!checkoutRoom?._id) {
        toast.error("Thiếu thông tin phòng để checkout!");
        return;
      }

      const currentBookingRes = await getCurrentBookingByRoom(checkoutRoom._id);
      const currentBookingData = currentBookingRes?.data;

        if (!currentBookingData?._id) {
          toast.error("Không tìm thấy booking nào đang active cho phòng này!");
          return;
        }

      await checkoutRoomApi(checkoutRoom._id, currentBookingData._id);

      console.log(checkoutRoom._id, currentBooking._id);

      toast.success(`Checkout phòng ${checkoutRoom.roomNumber} thành công`);
      setRooms((prev) =>
        prev.map((r) =>
          r._id === checkoutRoom._id ? { ...r, status: "available" } : r
        )
      );
      setIsCheckoutModalVisible(false);
      setCheckoutRoom(null);
    } catch (error) {
      toast.error(error.message || "Checkout thất bại!");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCalculatedPrice(0);
  };

  const handleCreateBooking = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (!selectedRoom) return;

        const stayTime = values.stayTime || [];
        const checkInDate = stayTime[0]?.toISOString();
        const checkOutDate = stayTime[1]?.toISOString();

        const bookingData = {
          roomId: selectedRoom._id,
          customerName: values.tenKhach,
          citizenId: values.cccd,
          checkInDate,
          checkOutDate,
          rentalsDays: values.numOfDays || values.duration || 1,
          stayType: values.stayType,
          paymentMethod: values.payment,
          totalPrice: calculatedPrice,
        };

        try {
          const res = await createBooking(bookingData);
          toast.success(`Đặt phòng thành công`)
          setIsModalVisible(false);
          form.resetFields();
          setCalculatedPrice(0);

          setRooms((prev) =>
            prev.map((r) =>
              r._id === selectedRoom._id ? { ...r, status: "booked" } : r
            )
          );
        } catch (err) {
          console.log(err);
          toast.error(err.message || "Đặt phòng thất bại!");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const stayTypeLabels = {
    daily: "Cả ngày",
    overnight: "Qua đêm",
    hourly: "Ngắn hạn",
  };

  const paymentMethodLabels = {
    cash: "Tiền mặt",
    banking: "Chuyển khoản",
  };

  const renderFloors = () => {
    const grouped = rooms.reduce((acc, room) => {
      acc[room.floor] = acc[room.floor] || [];
      acc[room.floor].push(room);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => a - b)
      .map((floor) => (
        <div key={floor} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 10 }}>
            {Number(floor) === 0 ? "Tầng trệt" : `Tầng ${floor}`}
          </h3>
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
                  color: "#080707ff",
                  height: 140,
                  width: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
                bodyStyle={{ padding: 6 }}
                onClick={() => handleRoomClick(room)}
              >
                <div style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: "8px"
                  }}>P{room.roomNumber}</div>
                <div style={{ fontSize: 14 }}>
                  {room.roomType && room.roomType.length > 0
                    ? (() => {
                        const baseName = room.roomType[0].name.replace(/\s*\(.*?\)/, "");
                        const details = room.roomType
                          .map(rt => rt.name.match(/\((.*?)\)/)?.[1])
                          .filter(Boolean)
                          .join(", ");

                        return details ? `${baseName} (${details})` : baseName;
                      })()
                    : "N/A"}
                </div>
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontSize: 14 }}>
                    {room.status === "available"
                      ? "Đang chờ"
                      : room.status === "booked"
                      ? "Đã đặt"
                      : room.status === "cleaning"
                      ? "Đang dọn"
                      : room.status}
                  </div>
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
          onOk={handleCreateBooking}
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

            {selectedRoom?.roomType?.length === 2 && (
              <Form.Item label="Chọn loại phòng">
                <Radio.Group
                  value={selectedRoomType}
                  onChange={(e) => {
                    const index = e.target.value;
                    setSelectedRoomType(index);
                    updatePriceForRoom(selectedRoom, stayType || "daily", 1, index);
                  }}
                >
                  {selectedRoom.roomType.map((rt, index) => (
                    <Radio key={rt._id} value={index}>
                      {rt.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            )}

            <Form.Item
              name="stayType"
              label="Loại hình thuê"
              rules={[{ required: true, message: "Vui lòng chọn loại hình thuê" }]}
            >
              <Radio.Group onChange={handleStayTypeChange}>
                <Radio value="daily">Cả ngày</Radio>
                <Radio value="overnight">Qua đêm</Radio>
                <Radio value="hourly">Ngắn hạn</Radio>
              </Radio.Group>
            </Form.Item>

            {stayType === "hourly" && (
              <Form.Item
                name="duration"
                label="Số giờ thuê"
                rules={[{ required: true, message: "Vui lòng nhập số giờ" }]}
              >
                <InputNumber
                  min={1}
                  max={24}
                  onChange={handleDurationChange}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )}

            {(stayType === "daily" || stayType === "overnight") && (
              <Form.Item
                name="numOfDays"
                label="Số ngày thuê"
                rules={[{ required: true, message: "Vui lòng nhập số ngày" }]}
              >
                <InputNumber
                  min={1}
                  onChange={handleNumOfDaysChange}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )}

            <Form.Item
              name="stayTime"
              label="Thời gian lưu trú"
              rules={[{ required: true, message: "Vui lòng chọn thời gian lưu trú" }]}
            >
              <RangePicker
                showTime={{ format: "HH:mm" }}
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                onChange={handleStayTimeChange}
              />
            </Form.Item>

            <Form.Item
              name="payment"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
            >
              <Select placeholder="Chọn phương thức">
                <Select.Option value="cash">Tiền mặt</Select.Option>
                <Select.Option value="banking">Chuyển khoản</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Tổng tiền (VNĐ)">
              <Input value={calculatedPrice.toLocaleString()} disabled />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={`Checkout phòng ${checkoutRoom?.roomNumber}`}
          open={isCheckoutModalVisible}
          onOk={handleCheckout}
          onCancel={() => {
            setIsCheckoutModalVisible(false);
            setCheckoutRoom(null);
            setCurrentBooking(null);
          }}
          okText="Xác nhận Checkout"
          cancelText="Hủy"
        >
          {currentBooking ? (
            <div>
              <p><b>Tên khách:</b> {currentBooking.customerName}</p>
              <p><b>CCCD:</b> {currentBooking.citizenId}</p>
              <p>
                <b>Thời gian:</b>{" "}
                {dayjs(currentBooking.checkInDate).format("DD/MM/YYYY HH:mm")} -{" "}
                {dayjs(currentBooking.checkOutDate).format("DD/MM/YYYY HH:mm")}
              </p>
              <p><b>Loại hình thuê:</b> {stayTypeLabels[currentBooking.stayType] || currentBooking.stayType}</p>
              <p><b>Số ngày/Giờ thuê:</b> {currentBooking.rentalsDays}</p>
              <p><b>Phương thức thanh toán:</b> {paymentMethodLabels[currentBooking.paymentMethod] || currentBooking.paymentMethod}</p>
              <p><b>Tổng tiền:</b> {currentBooking.totalPrice.toLocaleString()} VNĐ</p>
            </div>
          ) : (
            <p>Đang tải thông tin khách hàng...</p>
          )}
        </Modal>
      </div>
    </Content>
  );
};

export default Room;
