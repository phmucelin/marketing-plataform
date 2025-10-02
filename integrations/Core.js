// Mock integrations for development
export const UploadFile = async ({ file }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const file_url = e.target.result; // Data URL da imagem real
      console.log('✅ Upload concluído:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        urlLength: file_url.length
      });
      resolve({ file_url });
    };
    
    reader.onerror = (error) => {
      console.error('❌ Erro ao ler arquivo:', error);
      reject(error);
    };
    
    reader.readAsDataURL(file); // Converte a imagem para base64
  });
};

export const SendEmail = async ({ to, subject, body }) => {
  // Simulate email sending
  console.log('📧 Email enviado:', { to, subject, body });
  return { success: true };
};
