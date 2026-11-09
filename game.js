export const animals = [
  { id:'mosquito', name:'Con muỗi', rhyme:'vo ve', count:1, color:'#fff0b5', ink:'#91701c', instruction:'Giơ ngón trỏ, gập các ngón còn lại. Nhúc nhích ngón trỏ như chú muỗi đang bay nhé!', action:'Nhúc nhích ngón trỏ', sound:'Con muỗi vo ve' },
  { id:'rabbit', name:'Con thỏ', rhyme:'đáng yêu', count:2, color:'#ffdae4', ink:'#a54868', instruction:'Giơ ngón trỏ và ngón giữa thành đôi tai thỏ. Co duỗi hai ngón tay, thỏ con vẫy tai nào!', action:'Vẫy hai chiếc tai thỏ', sound:'Con thỏ đáng yêu' },
  { id:'cat', name:'Con mèo', rhyme:'meo meo', count:3, color:'#d6ecfc', ink:'#3d7195', instruction:'Giơ ngón trỏ, ngón giữa và ngón áp út. Nhúc nhích ba ngón tay rồi cùng kêu meo meo!', action:'Nhúc nhích ba ngón tay', sound:'Con mèo meo meo' },
  { id:'crab', name:'Con cua', rhyme:'bò ngang', count:4, color:'#e0efbf', ink:'#647b39', instruction:'Giơ bốn ngón tay, gập ngón cái vào lòng bàn tay. Nhúc nhích các ngón và đưa tay sang ngang như cua bò!', action:'Đưa bàn tay sang ngang', sound:'Con cua bò ngang' },
  { id:'butterfly', name:'Con bướm', rhyme:'bay bay', count:5, color:'#e8dcfc', ink:'#7b5a9e', instruction:'Xòe cả năm ngón tay. Nhúc nhích các ngón và vẫy bàn tay nhẹ nhàng như cánh bướm bay!', action:'Vẫy bàn tay như cánh bướm', sound:'Con bướm bay bay' },
];
export function eligibleAnimals(noRepeat, seen) {
  if (!noRepeat) return [...animals];
  const remaining = animals.filter(a => !seen.includes(a.id));
  return remaining.length ? remaining : [...animals];
}
export function pickAnimal(pool, random = Math.random) {
  if (!pool.length) throw new Error('Cần ít nhất một con vật');
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
export function targetRotation(current, index, turns = 5) {
  const desired = (360 - index * 72) % 360;
  const offset = (desired - ((current % 360) + 360) % 360 + 360) % 360;
  return current + turns * 360 + offset;
}
