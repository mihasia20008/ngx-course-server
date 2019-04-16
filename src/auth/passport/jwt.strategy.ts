
import * as passport from 'passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { ConfigService } from 'src/config.service';

@Injectable()
export class JwtStrategy extends Strategy {
    public constructor(
        private readonly _authService: AuthService,
        private readonly _config: ConfigService,
    ) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
                secretOrKey:  _config.get('secret'),
            },
            async (req: Request, payload: any, next: NextFunction) => await this.verify(req, payload, next),
        );
        passport.use(this);
    }

    public async verify(_req: Request, payload: any, done: VerifiedCallback): Promise<void> {
        const isValid: boolean = await this._authService.validateUser(payload.username);

        if (!isValid) {
            return done(null, false);
        }
        return done(null, payload);
    }
}