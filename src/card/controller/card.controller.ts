import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CreateCardDto } from '../dto/card.dto';
import { CardService } from '../services/card.service';
import { ICard } from '../schemas/card.schema';
import { PresetNotificationsLogService } from '../../notification/services/preset-notifcation.service';

@ApiUseTags('cards')
@Controller('cards')
export class CardController {
    public constructor(
        private _cardService: CardService,
        private readonly _notifyService: PresetNotificationsLogService,
    ) {}

    @Post('create')
    @ApiOperation({ title: 'Create card)' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'The record has been successfully created.' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'The record already exists' })
    public async signUp(
        @Body() createUserDto: CreateCardDto,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<Response> {
        try {
            const username: string = req.user.username;
            const createCard: ICard | null = await this._cardService.createCard({
                ...createUserDto,
                owner: username
            });
            if (!Boolean(createCard)) {
                throw new Error('Could not create card');
            }
            await this._notifyService.notify({
                title: 'Card has just been created!',
                text: createCard.description,
                author: username,
            });
            return res.status(HttpStatus.OK).json({ data: createCard, error: null });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ data: null, error });
        }
    }

    @Get('by/:id')
    @ApiOperation({ title: 'Get card' })
    @ApiResponse({ status: HttpStatus.OK })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    public async getCurrentCard(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<Response> {
        try {
            const query: { _id: Types.ObjectId } = { _id: Types.ObjectId(id) };
            const createCardById: ICard | null = await this._cardService.getCardById(query);
            if (!createCardById) {
                throw new Error('Could not get card by id');
            }
            return res.status(HttpStatus.OK).json({ data: createCardById, error: null });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ data: null, error: error.message });
        }
    }

    @Get('all')
    @ApiOperation({ title: 'Get all cards' })
    @ApiResponse({ status: HttpStatus.OK })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    public async getAllCards(@Req() req: Request, @Res() res: Response): Promise<Response> {
        try {
            const getAll: ICard[] = (await this._cardService.getAllCards()) || [];
            if (!Boolean(getAll.length)) {
                throw new Error('Could not get all cards');
            }
            return res.status(HttpStatus.OK).json({ data: getAll, error: null });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ data: null, error: error.message });
        }
    }

    @Delete('by/:id')
    @ApiOperation({ title: 'Delete card' })
    @ApiResponse({ status: HttpStatus.OK })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    public async deleteCard(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<Response> {
        try {
            const username: string = req.user.username;
            const query: { _id: Types.ObjectId } = { _id: Types.ObjectId(id) };
            const deleteCardById: ICard | null = await this._cardService.deleteCard(query);
            if (!deleteCardById) {
                throw new Error('Could not delete card by id');
            }
            await this._notifyService.notify({
                title: 'Card has been successfully deleted!',
                text: deleteCardById.description,
                author: username,
            });
            return res.status(HttpStatus.OK).json({ data: deleteCardById, error: null });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ data: null, error: error.message });
        }
    }

    @Put('by/:id')
    @ApiOperation({ title: 'Update card' })
    @ApiResponse({ status: HttpStatus.OK })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    public async updateCard(
        @Param('id') id: string,
        @Req() req: Request,
        @Body() createUserDto: CreateCardDto,
        @Res() res: Response
    ): Promise<Response> {
        try {
            const username: string = req.user.username;
            const query: { _id: Types.ObjectId } = { _id: Types.ObjectId(id) };
            const updateCardById: ICard | null = await this._cardService.updateCard(query, createUserDto);
            if (!updateCardById) {
                throw new Error('Could not update card by id');
            }
            await this._notifyService.notify({
                title: 'Card has been successfully updated!',
                text: updateCardById.description,
                author: username,
            });
            return res.status(HttpStatus.OK).json({ data: updateCardById, error: null });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ data: null, error: error.message });
        }
    }
}