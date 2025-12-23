
import { Service, Project, Testimonial } from './types';

export const SERVICES: Service[] = [
  {
    title: 'Thiết kế Kiến trúc',
    description: 'Kiến tạo không gian sống xanh, tối ưu ánh sáng tự nhiên và công năng sử dụng.',
    icon: 'fa-pencil-ruler'
  },
  {
    title: 'Thi công Trọn gói',
    description: 'Cam kết chất lượng chuẩn từng chi tiết, bàn giao chìa khóa trao tay đúng tiến độ.',
    icon: 'fa-hard-hat'
  },
  {
    title: 'Nội thất Thông minh',
    description: 'Giải pháp nội thất 4.0 tối ưu hóa diện tích và mang lại trải nghiệm tiện nghi vượt trội.',
    icon: 'fa-couch'
  }
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Biệt thự vườn Yên Khánh',
    category: 'Nhà vườn',
    image: 'https://i.postimg.cc/8z4KkxYF/noi-that-1.jpg'
  },
  {
    id: 2,
    title: 'Nhà phố Hiện đại Mỹ Đình',
    category: 'Nhà phố',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Penthouse Luxury Gold',
    category: 'Nội thất',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'Villa Nghỉ dưỡng Sóc Sơn',
    category: 'Biệt thự',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Anh Hoàng Nam',
    comment: 'Tôi rất hài lòng với quy trình làm việc của NCA Homepro. Nhà xây xong đẹp hơn cả phối cảnh 3D.',
    avatar: 'https://i.pravatar.cc/150?u=1',
    stars: 5
  },
  {
    name: 'Chị Minh Thư',
    comment: 'Thiết kế xanh rất thông minh, nhà lúc nào cũng mát mẻ dù trời Hà Nội nắng gắt. Cảm ơn đội ngũ kiến trúc sư.',
    avatar: 'https://i.pravatar.cc/150?u=2',
    stars: 5
  },
  {
    name: 'Anh Tuấn Kiệt',
    comment: 'Giá cả cực kỳ hợp lý so với chất lượng hoàn thiện. Chế độ bảo hành cũng rất nhanh chóng.',
    avatar: 'https://i.pravatar.cc/150?u=3',
    stars: 5
  }
];
