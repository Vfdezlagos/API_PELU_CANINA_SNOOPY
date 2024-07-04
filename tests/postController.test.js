import { register, listPosts, findPostById, deletePostById } from './path/to/your/controller';
import postModel from './path/to/your/models/Post';
import validate from './path/to/your/helpers/validate';

// Mock the dependencies
jest.mock('./path/to/your/models/Post');
jest.mock('./path/to/your/helpers/validate');

describe('Post Controller', () => {
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res;
    };

    const mockRequest = (body, user, params) => {
        return {
            body,
            user,
            params
        };
    };

    describe('register', () => {
        it('should return an error if the user is not an admin', () => {
            const req = mockRequest({}, { role: 'user' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(false);

            register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Debes ser administrador para acceder a esta acción'
            });
        });

        it('should return an error if post data is invalid', () => {
            const req = mockRequest({ title: '' }, { role: 'admin' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            validate.Post.mockReturnValue(false);

            register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Faltan campos por mandar o hay algun dato que no es valido (revisar consola)'
            });
        });

        it('should create a post successfully', async () => {
            const req = mockRequest({ title: 'Test Post', content: 'Test Content' }, { role: 'admin' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            validate.Post.mockReturnValue(true);
            postModel.create.mockResolvedValue({ _id: '123', title: 'Test Post', content: 'Test Content' });

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Post creado con exito',
                post: { _id: '123', title: 'Test Post', content: 'Test Content' }
            });
        });

        it('should handle errors during post creation', async () => {
            const req = mockRequest({ title: 'Test Post', content: 'Test Content' }, { role: 'admin' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            validate.Post.mockReturnValue(true);
            postModel.create.mockRejectedValue(new Error('DB error'));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Error al intentar registrar el post en DB'
            });
        });
    });

    describe('listPosts', () => {
        it('should list posts successfully', async () => {
            const req = {};
            const res = mockResponse();

            postModel.find.mockResolvedValue([{ _id: '123', title: 'Test Post', content: 'Test Content' }]);

            await listPosts(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Listado de publicaciones',
                posts: [{ _id: '123', title: 'Test Post', content: 'Test Content' }]
            });
        });

        it('should handle no posts found', async () => {
            const req = {};
            const res = mockResponse();

            postModel.find.mockResolvedValue([]);

            await listPosts(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Not Found',
                message: 'No se encontraron publicaciones'
            });
        });

        it('should handle errors during listing posts', async () => {
            const req = {};
            const res = mockResponse();

            postModel.find.mockRejectedValue(new Error('DB error'));

            await listPosts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Error al intentar buscar publicaciones en DB'
            });
        });
    });

    describe('findPostById', () => {
        it('should return an error if the user is not an admin', () => {
            const req = mockRequest({}, { role: 'user' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(false);

            findPostById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Debes ser administrador para acceder a esta acción'
            });
        });

        it('should return a post by id', async () => {
            const req = mockRequest({}, { role: 'admin' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            postModel.findById.mockResolvedValue({ _id: '123', title: 'Test Post', content: 'Test Content' });

            await findPostById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Post encontrado',
                post: { _id: '123', title: 'Test Post', content: 'Test Content' }
            });
        });

        it('should handle post not found', async () => {
            const req = mockRequest({}, { role: 'admin' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            postModel.findById.mockResolvedValue(null);

            await findPostById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'No se encontró el post'
            });
        });

        it('should handle errors during finding post by id', async () => {
            const req = mockRequest({}, { role: 'admin' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            postModel.findById.mockRejectedValue(new Error('DB error'));

            await findPostById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Error al intentar buscar el post en DB'
            });
        });
    });

    describe('deletePostById', () => {
        it('should return an error if the user is not an admin', () => {
            const req = mockRequest({}, { role: 'user' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(false);

            deletePostById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Debes ser administrador para acceder a esta acción'
            });
        });

        it('should delete a post by id', async () => {
            const req = mockRequest({}, { role: 'admin' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            postModel.findByIdAndDelete.mockResolvedValue({ _id: '123', title: 'Test Post', content: 'Test Content', image1: 'test_image1.png', image2: 'test_image2.png' });

            fs.unlinkSync = jest.fn();

            await deletePostById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Post eliminado exitosamente',
                post: { _id: '123', title: 'Test Post', content: 'Test Content', image1: 'test_image1.png', image2: 'test_image2.png' }
            });
            expect(fs.unlinkSync).toHaveBeenCalledWith('public/images/uploads/posts/test_image1.png');
            expect(fs.unlinkSync).toHaveBeenCalledWith('public/images/uploads/posts/test_image2.png');
        });

        it('should handle post not found during deletion', async () => {
            const req = mockRequest({}, { role: 'admin' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            postModel.findByIdAndDelete.mockResolvedValue(null);

            await deletePostById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'No se encontró el post'
            });
        });

        it('should handle errors during deleting post by id', async () => {
            const req = mockRequest({}, { role: 'admin' }, { id: '123' });
            const res = mockResponse();

            validate.Admin.mockReturnValue(true);
            postModel.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

            await deletePostById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                status: 'Error',
                message: 'Error al intentar eliminar el post en DB'
            });
        });
    });
});
