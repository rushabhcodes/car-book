export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'dealer';
  status: 'active' | 'inactive' | 'pending';
}